import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import type { Carousel, CarouselDirectoryItem, CarouselSlide, CarouselSlideVariant, CarouselTheme } from '@/lib/types'

const carouselsDir = path.resolve(process.cwd(), 'carousels')
const carouselIndexPath = path.join(carouselsDir, 'index.json')
const SUPPORTED_SOURCE_TYPES = new Set(['transcript', 'notes', 'custom'])
const SLIDE_VARIANTS = new Set<CarouselSlideVariant>(['claim', 'quote', 'framework', 'explainer'])

export async function getCarouselDirectory(): Promise<CarouselDirectoryItem[]> {
  const items = await loadCarouselsFromFiles()
  if (items.length > 0) {
    return items
      .map(toDirectoryItem)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.slug.localeCompare(b.slug))
  }

  const raw = await readFile(carouselIndexPath, 'utf8')
  return JSON.parse(raw) as CarouselDirectoryItem[]
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
  const carousels = await Promise.all(slugs.map(async (slug) => {
    try {
      return await readCarouselFromSupportedSource(slug)
    } catch {
      return undefined
    }
  }))

  return carousels.filter((carousel): carousel is Carousel => Boolean(carousel))
}

async function readCarouselFromSupportedSource(slug: string) {
  const mdPath = path.join(carouselsDir, slug, 'carousel.md')
  try {
    const raw = await readFile(mdPath, 'utf8')
    return parseMarkdownCarousel(raw, slug)
  } catch {
    const raw = await readFile(path.join(carouselsDir, slug, 'carousel.json'), 'utf8')
    return normalizeLegacyCarousel(JSON.parse(raw) as LegacyCarousel)
  }
}

function parseMarkdownCarousel(raw: string, fallbackSlug: string): Carousel {
  const parsed = matter(raw)
  const data = parsed.data as Record<string, unknown>
  const slug = getString(data.slug) || fallbackSlug
  const title = requireString(data.title, 'title')
  const description = requireString(data.description, 'description')
  const sourceTypeValue = getString(data.sourceType) || 'custom'
  const sourceType = SUPPORTED_SOURCE_TYPES.has(sourceTypeValue) ? sourceTypeValue as CarouselDirectoryItem['sourceType'] : 'custom'
  const aspectRatio = (getString(data.aspectRatio) || 'portrait') as CarouselDirectoryItem['aspectRatio']
  const updatedAt = getString(data.updatedAt) || new Date().toISOString().slice(0, 10)
  const theme = normalizeTheme(data.theme)
  const slides = parseSlides(parsed.content)

  return {
    slug,
    title,
    description,
    sourceType,
    aspectRatio,
    updatedAt,
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
  let variant: CarouselSlideVariant | undefined

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

    const variantMatch = line.match(/^variant\s*:\s*(.+)$/i)
    if (variantMatch) {
      variant = normalizeVariant(variantMatch[1])
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
    variant: variant ?? inferSlideVariant(title, body, eyebrow),
  }
}

function inferSlideVariant(title: string, body: string, eyebrow?: string): CarouselSlideVariant {
  const blocks = body
    .split(/\n\s*\n/)
    .map((section) => section.trim())
    .filter(Boolean)
  const lines = blocks.flatMap((section) => section.split(/\r?\n/).map((line) => line.trim()).filter(Boolean))
  const lowerTitle = title.toLowerCase()
  const lowerBody = body.toLowerCase()
  const lowerEyebrow = (eyebrow ?? '').toLowerCase()
  const allList = lines.length > 0 && lines.every((line) => /^([-*]|\d+\.)\s+/.test(line))
  const quoteLike = lines.length > 0 && lines.every((line) => /^>\s?/.test(line))

  if (allList || /\b(framework|playbook|steps|process|system|stack|checklist|roadmap|three|4|five|pillars?)\b/i.test(`${title} ${eyebrow ?? ''}`)) {
    return 'framework'
  }

  if (quoteLike || /^['"“”]/.test(title) || /\bquote|thesis|belief|principle\b/i.test(`${lowerTitle} ${lowerEyebrow}`)) {
    return 'quote'
  }

  if (
    title.length <= 90 &&
    /\b(why|how|mistake|truth|problem|moat|edge|real|not|without|stop|start|most|better)\b/i.test(lowerTitle) &&
    lowerBody.length <= 320
  ) {
    return 'claim'
  }

  return 'explainer'
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
    theme: carousel.theme,
  }
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

function normalizeVariant(value: string) {
  const normalized = value.trim().toLowerCase() as CarouselSlideVariant
  return SLIDE_VARIANTS.has(normalized) ? normalized : undefined
}

type LegacyCarousel = Omit<Carousel, 'slides'> & {
  slides: Array<{
    id: string
    eyebrow?: string
    title: string
    body: string[] | string
    variant?: CarouselSlideVariant
  }>
}

function normalizeLegacyCarousel(carousel: LegacyCarousel): Carousel {
  return {
    ...carousel,
    slides: carousel.slides.map((slide, index) => ({
      id: slide.id || String(index + 1).padStart(2, '0'),
      eyebrow: slide.eyebrow,
      title: slide.title,
      body: Array.isArray(slide.body) ? slide.body.join('\n\n') : slide.body,
      variant: slide.variant ?? inferSlideVariant(slide.title, Array.isArray(slide.body) ? slide.body.join('\n\n') : slide.body, slide.eyebrow),
    })),
  }
}
