import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import type { Carousel, CarouselDirectoryItem, CarouselSlide, CarouselTheme } from '@/lib/types'

const carouselsDir = path.resolve(process.cwd(), 'carousels')
const sourcesDir = path.resolve(process.cwd(), 'sources')
const carouselIndexPath = path.join(carouselsDir, 'index.json')
const SUPPORTED_SOURCE_TYPES = new Set(['transcript', 'notes', 'custom'])

export async function getCarouselDirectory(): Promise<CarouselDirectoryItem[]> {
  const items = await loadCarouselsFromFiles()
  if (items.length > 0) {
    return sortDirectoryItems(items.map(toDirectoryItem))
  }

  const raw = await readFile(carouselIndexPath, 'utf8')
  return JSON.parse(raw) as CarouselDirectoryItem[]
}

export async function syncCarouselDirectoryIndex() {
  const items = sortDirectoryItems((await loadCarouselsFromFiles()).map(toDirectoryItem))
  await writeFile(carouselIndexPath, `${JSON.stringify(items, null, 2)}\n`, 'utf8')
  return items
}

export async function getCarousel(slug: string): Promise<Carousel | undefined> {
  try {
    return await readCarouselFromSupportedSource(slug)
  } catch {
    return undefined
  }
}

async function loadCarouselsFromFiles() {
  const entries = await readdir(carouselsDir, { withFileTypes: true })
  const slugs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name)
  const sourceCreatedAtBySlug = await loadSourceCreatedAtByCarouselSlug()
  const carousels = await Promise.all(slugs.map(async (slug) => {
    try {
      return await readCarouselFromSupportedSource(slug, sourceCreatedAtBySlug[slug])
    } catch {
      return undefined
    }
  }))

  return carousels.filter((carousel): carousel is Carousel => Boolean(carousel))
}

async function readCarouselFromSupportedSource(slug: string, sourceCreatedAt?: string) {
  const mdPath = path.join(carouselsDir, slug, 'carousel.md')
  try {
    const raw = await readFile(mdPath, 'utf8')
    return parseMarkdownCarousel(raw, slug, sourceCreatedAt)
  } catch {
    const raw = await readFile(path.join(carouselsDir, slug, 'carousel.json'), 'utf8')
    return normalizeLegacyCarousel(JSON.parse(raw) as LegacyCarousel, sourceCreatedAt)
  }
}

function parseMarkdownCarousel(raw: string, fallbackSlug: string, sourceCreatedAt?: string): Carousel {
  const parsed = matter(raw)
  const data = parsed.data as Record<string, unknown>
  const slug = getString(data.slug) || fallbackSlug
  const title = requireString(data.title, 'title')
  const description = requireString(data.description, 'description')
  const sourceTypeValue = getString(data.sourceType) || 'custom'
  const sourceType = SUPPORTED_SOURCE_TYPES.has(sourceTypeValue) ? sourceTypeValue as CarouselDirectoryItem['sourceType'] : 'custom'
  const aspectRatio = (getString(data.aspectRatio) || 'portrait') as CarouselDirectoryItem['aspectRatio']
  const updatedAt = getString(data.updatedAt) || new Date().toISOString().slice(0, 10)
  const createdAt = getString(data.createdAt) || sourceCreatedAt || updatedAt
  const theme = normalizeTheme(data.theme)
  const slides = parseSlides(parsed.content)

  return {
    slug,
    title,
    description,
    sourceType,
    aspectRatio,
    updatedAt,
    createdAt,
    theme,
    slides,
  }
}

function parseSlides(content: string): CarouselSlide[] {
  const sections = content
    .split(/^---\s*$/m)
    .map((section) => section.trim())
    .filter(Boolean)

  return sections.map((section, index) => parseSlideSection(section, index))
}

function parseSlideSection(section: string, index: number): CarouselSlide {
  const lines = section.split(/\r?\n/)
  let cursor = 0
  let eyebrow: string | undefined

  while (cursor < lines.length && !lines[cursor]?.trim()) cursor++

  while (cursor < lines.length) {
    const line = lines[cursor]?.trim()
    if (!line) {
      cursor++
      continue
    }

    const eyebrowMatch = line.match(/^eyebrow\s*:\s*(.+)$/i)
    if (eyebrowMatch) {
      eyebrow = eyebrowMatch[1]?.trim()
      cursor++
      continue
    }

    break
  }

  while (cursor < lines.length && !lines[cursor]?.trim()) cursor++

  const titleLine = lines[cursor]?.trim()
  if (!titleLine) {
    throw new Error(`Slide ${index + 1} is missing a title.`)
  }

  const headingMatch = titleLine.match(/^#{1,6}\s+(.+)$/)
  if (!headingMatch) {
    throw new Error(`Slide ${index + 1} title must use a markdown heading.`)
  }

  const title = headingMatch[1].trim()
  const body = lines.slice(cursor + 1).join('\n').trim()

  return {
    id: String(index + 1).padStart(2, '0'),
    eyebrow,
    title,
    body,
  }
}

function normalizeTheme(value: unknown): CarouselTheme | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined
  }

  const theme = value as Record<string, unknown>
  return {
    accent: getString(theme.accent),
    background: getString(theme.background),
    foreground: getString(theme.foreground),
    muted: getString(theme.muted),
  }
}

function toDirectoryItem(carousel: Carousel): CarouselDirectoryItem {
  return {
    slug: carousel.slug,
    title: carousel.title,
    description: carousel.description,
    sourceType: carousel.sourceType,
    aspectRatio: carousel.aspectRatio,
    updatedAt: carousel.updatedAt,
    createdAt: carousel.createdAt,
    theme: carousel.theme,
  }
}

function sortDirectoryItems(items: CarouselDirectoryItem[]) {
  return items.sort((a, b) => {
    const createdCompare = (b.createdAt || b.updatedAt).localeCompare(a.createdAt || a.updatedAt)
    return createdCompare || b.updatedAt.localeCompare(a.updatedAt) || a.slug.localeCompare(b.slug)
  })
}

function requireString(value: unknown, field: string) {
  const normalized = getString(value)
  if (!normalized) {
    throw new Error(`Missing required carousel field: ${field}`)
  }
  return normalized
}

function getString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

async function loadSourceCreatedAtByCarouselSlug() {
  const createdAtBySlug: Record<string, string> = {}

  try {
    const entries = await readdir(sourcesDir, { withFileTypes: true })
    const sourceDirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name)

    await Promise.all(sourceDirs.map(async (sourceSlug) => {
      try {
        const raw = await readFile(path.join(sourcesDir, sourceSlug, 'source.json'), 'utf8')
        const data = JSON.parse(raw) as {
          fetchedAt?: string
          carousels?: Array<{ slug?: string }>
          briefs?: Array<{ slug?: string }>
        }
        const createdAt = getString(data.fetchedAt)
        if (!createdAt) return

        for (const entry of [...(data.carousels ?? []), ...(data.briefs ?? [])]) {
          const slug = getString(entry.slug)
          if (!slug) continue
          createdAtBySlug[slug] = createdAt
        }
      } catch {
        // Ignore malformed or partial source packages.
      }
    }))
  } catch {
    // Ignore missing sources directory in partial builds.
  }

  return createdAtBySlug
}

type LegacyCarousel = Omit<Carousel, 'slides'> & {
  slides: Array<{
    id: string
    eyebrow?: string
    title: string
    body: string[] | string
  }>
}

function normalizeLegacyCarousel(carousel: LegacyCarousel, sourceCreatedAt?: string): Carousel {
  return {
    ...carousel,
    createdAt: carousel.createdAt || sourceCreatedAt || carousel.updatedAt,
    slides: carousel.slides.map((slide, index) => ({
      id: slide.id || String(index + 1).padStart(2, '0'),
      eyebrow: slide.eyebrow,
      title: slide.title,
      body: Array.isArray(slide.body) ? slide.body.join('\n\n') : slide.body,
    })),
  }
}
