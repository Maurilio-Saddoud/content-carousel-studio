import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { isDirectExecution } from './direct-execution'

type SourceManifest = {
  slug?: string
  publishedIdeaIds?: string[]
  carousels?: Array<{ segmentId?: string; slug?: string; title?: string }>
}

type ExportManifest = {
  slug?: string
  files?: Array<string | { fileName?: string }>
  slideCount?: number
}

type BriefRecord = {
  id?: string
  thesis?: string
  audience?: string
  whyItMatters?: string
  supportPoints?: string[]
  carouselSlug?: string
}

type AuditIssue = {
  level: 'error' | 'warn' | 'info'
  code: string
  message: string
}

export async function runSelfTestFromArgv(argv: string[] = process.argv.slice(2)) {
  const args = parseArgs(argv)
  const issues = await auditSource(args.sourceSlug, { strictGlobal: args.strictGlobal })

  const counts = issues.reduce(
    (acc, issue) => {
      acc[issue.level] += 1
      return acc
    },
    { error: 0, warn: 0, info: 0 },
  )

  console.log(`Self-test: ${args.sourceSlug}`)
  console.log(`Errors: ${counts.error}  Warnings: ${counts.warn}  Notes: ${counts.info}`)

  for (const issue of issues) {
    const prefix = issue.level === 'error' ? 'ERROR' : issue.level === 'warn' ? 'WARN ' : 'INFO '
    console.log(`${prefix} [${issue.code}] ${issue.message}`)
  }

  if (counts.error > 0) {
    process.exitCode = 1
  }
}

async function auditSource(sourceSlug: string, options: { strictGlobal?: boolean } = {}) {
  const sourceDir = path.resolve('sources', sourceSlug)
  const rawSource = await readFile(path.join(sourceDir, 'source.json'), 'utf8')
  const source = JSON.parse(rawSource) as SourceManifest
  const ideas = JSON.parse(await readFile(path.join(sourceDir, 'ideas.json'), 'utf8')) as Array<Record<string, unknown>>
  const briefs = await readBriefs(sourceDir)
  const carousels = await Promise.all(
    (source.carousels ?? [])
      .filter((entry): entry is { segmentId?: string; slug: string; title?: string } => Boolean(entry.slug))
      .map(async (entry) => ({
        sourceEntry: entry,
        markdown: await readCarousel(entry.slug),
      })),
  )

  const issues: AuditIssue[] = []
  const publishedIdeas = ideas.filter((idea) => idea.status === 'published')
  const publishedIdeaIds = new Set(publishedIdeas.map((idea) => String(idea.id)))
  const manifestIdeaIds = new Set((source.publishedIdeaIds ?? []).map(String))

  for (const ideaId of publishedIdeaIds) {
    if (!manifestIdeaIds.has(ideaId)) {
      issues.push({ level: 'error', code: 'manifest-missing-published-id', message: `${ideaId} is published in ideas.json but missing from source.json` })
    }
  }

  for (const ideaId of manifestIdeaIds) {
    if (!publishedIdeaIds.has(ideaId)) {
      issues.push({ level: 'error', code: 'ideas-missing-published-id', message: `${ideaId} is listed as published in source.json but not marked published in ideas.json` })
    }
  }

  if ((source.carousels ?? []).length !== publishedIdeas.length) {
    issues.push({
      level: 'warn',
      code: 'published-count-mismatch',
      message: `source.json lists ${(source.carousels ?? []).length} carousel(s) but ideas.json has ${publishedIdeas.length} published idea(s).`,
    })
  }

  if (briefs.length === 0) {
    issues.push({ level: 'warn', code: 'missing-briefs', message: `${sourceSlug} has no briefs.json records yet.` })
  } else {
    auditBriefs(briefs, issues)
  }

  const carouselTitles = new Map<string, string[]>()
  const slideTitles = new Map<string, string[]>()

  for (const { sourceEntry, markdown } of carousels) {
    carouselTitles.set(markdown.title.toLowerCase(), [...(carouselTitles.get(markdown.title.toLowerCase()) ?? []), markdown.slug])

    if (isWeakTitle(markdown.title)) {
      issues.push({ level: 'warn', code: 'weak-carousel-title', message: `${markdown.slug} has a weak opening/title: "${markdown.title}"` })
    }

    const manifest = await readExportManifest(markdown.slug)
    if (!manifest) {
      issues.push({ level: 'warn', code: 'missing-export-manifest', message: `${markdown.slug} has no public/exports manifest yet.` })
    } else {
      const fileCount =
        manifest.files?.filter((file) => {
          const fileName = typeof file === 'string' ? file : file.fileName ?? ''
          return /\.png$/i.test(fileName)
        }).length ?? 0
      if (fileCount !== markdown.slides.length) {
        issues.push({
          level: 'error',
          code: 'export-slide-count-mismatch',
          message: `${markdown.slug} has ${markdown.slides.length} slide(s) but export manifest lists ${fileCount} PNG(s).`,
        })
      }
    }

    for (const slide of markdown.slides) {
      const key = slide.title.toLowerCase()
      slideTitles.set(key, [...(slideTitles.get(key) ?? []), `${markdown.slug}#${slide.id}`])
      if (isWeakTitle(slide.title)) {
        issues.push({ level: 'warn', code: 'weak-slide-title', message: `${markdown.slug}#${slide.id} has a weak title: "${slide.title}"` })
      }
    }

    if (sourceEntry.title && normalize(sourceEntry.title) !== normalize(markdown.title)) {
      issues.push({
        level: 'warn',
        code: 'source-title-drift',
        message: `${markdown.slug} title drifted: source.json has "${sourceEntry.title}" but carousel.md has "${markdown.title}"`,
      })
    }
  }

  for (const [title, slugs] of carouselTitles) {
    if (title && slugs.length > 1) {
      issues.push({ level: 'error', code: 'duplicate-carousel-title', message: `Duplicate carousel title across: ${slugs.join(', ')}` })
    }
  }

  for (const [title, refs] of slideTitles) {
    if (title && refs.length > 1) {
      issues.push({ level: 'warn', code: 'duplicate-slide-title', message: `Duplicate slide title "${title}" across: ${refs.join(', ')}` })
    }
  }

  const carouselDirSlugs = await listDirectoryNames(path.resolve('carousels'))
  const exportDirSlugs = await listDirectoryNames(path.resolve('public', 'exports'))
  const expectedSlugs = new Set((source.carousels ?? []).map((entry) => entry.slug).filter(Boolean) as string[])

  if (options.strictGlobal) {
    for (const slug of carouselDirSlugs) {
      if (slug === 'index.json') continue
      if (!expectedSlugs.has(slug) && slug !== '.DS_Store') {
        issues.push({ level: 'info', code: 'extra-carousel-dir', message: `carousels/${slug} exists but is not part of source ${sourceSlug}.` })
      }
    }

    for (const slug of exportDirSlugs) {
      if (slug === 'index.html' || slug === 'index.json' || slug === '.DS_Store') continue
      if (!expectedSlugs.has(slug)) {
        issues.push({ level: 'info', code: 'stale-export-dir', message: `public/exports/${slug} exists but is not part of source ${sourceSlug}.` })
      }
    }
  }

  if (issues.length === 0) {
    issues.push({ level: 'info', code: 'clean', message: 'No obvious source/markdown/export drift detected.' })
  }

  return issues
}

async function readCarousel(slug: string) {
  const raw = await readFile(path.resolve('carousels', slug, 'carousel.md'), 'utf8')
  const parsed = matter(raw)
  const sections = parsed.content
    .split(/^---\s*$/m)
    .map((section) => section.trim())
    .filter(Boolean)

  const slides = sections.map((section, index) => {
    const lines = section.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    const heading = lines.find((line) => /^#{1,6}\s+/.test(line)) ?? `# Slide ${index + 1}`
    return {
      id: String(index + 1).padStart(2, '0'),
      title: heading.replace(/^#{1,6}\s+/, '').trim(),
    }
  })

  return {
    slug,
    title: String(parsed.data.title ?? slug).trim(),
    slides,
  }
}

async function readExportManifest(slug: string) {
  try {
    const raw = await readFile(path.resolve('public', 'exports', slug, 'manifest.json'), 'utf8')
    return JSON.parse(raw) as ExportManifest
  } catch {
    return undefined
  }
}

async function readBriefs(sourceDir: string) {
  try {
    const raw = await readFile(path.join(sourceDir, 'briefs.json'), 'utf8')
    return JSON.parse(raw) as BriefRecord[]
  } catch {
    return []
  }
}

function auditBriefs(briefs: BriefRecord[], issues: AuditIssue[]) {
  const thesisOwners = new Map<string, string[]>()

  for (const brief of briefs) {
    const briefId = brief.id ?? brief.carouselSlug ?? 'unknown-brief'
    const thesis = String(brief.thesis ?? '').trim()
    const whyItMatters = String(brief.whyItMatters ?? '').trim()
    const supportPoints = Array.isArray(brief.supportPoints) ? brief.supportPoints.map((value) => String(value).trim()).filter(Boolean) : []

    if (isWeakBriefLine(thesis)) {
      issues.push({ level: 'warn', code: 'weak-brief-thesis', message: `${briefId} has a weak thesis: "${thesis}"` })
    }

    if (isWeakBriefLine(whyItMatters)) {
      issues.push({ level: 'warn', code: 'weak-brief-why', message: `${briefId} has a weak why-it-matters line: "${whyItMatters}"` })
    }

    if (supportPoints.length < 2) {
      issues.push({ level: 'warn', code: 'thin-brief-support', message: `${briefId} only has ${supportPoints.length} support point(s).` })
    }

    for (const supportPoint of supportPoints) {
      if (isWeakBriefLine(supportPoint)) {
        issues.push({ level: 'warn', code: 'weak-brief-support', message: `${briefId} has a weak support point: "${supportPoint}"` })
      }
    }

    const thesisKey = normalize(thesis)
    if (thesisKey) {
      thesisOwners.set(thesisKey, [...(thesisOwners.get(thesisKey) ?? []), briefId])
    }
  }

  for (const [thesis, refs] of thesisOwners) {
    if (thesis && refs.length > 1) {
      issues.push({ level: 'warn', code: 'duplicate-brief-thesis', message: `Duplicate brief thesis across: ${refs.join(', ')}` })
    }
  }

  for (let index = 0; index < briefs.length; index += 1) {
    for (let otherIndex = index + 1; otherIndex < briefs.length; otherIndex += 1) {
      const left = briefs[index]
      const right = briefs[otherIndex]
      const leftId = left.id ?? left.carouselSlug ?? `brief-${index + 1}`
      const rightId = right.id ?? right.carouselSlug ?? `brief-${otherIndex + 1}`

      const leftClaim = [left.thesis, left.whyItMatters, ...(left.supportPoints ?? [])].join(' ')
      const rightClaim = [right.thesis, right.whyItMatters, ...(right.supportPoints ?? [])].join(' ')
      const similarity = overlapScore(leftClaim, rightClaim)

      if (similarity >= 0.52) {
        issues.push({
          level: 'warn',
          code: 'brief-overlap',
          message: `${leftId} and ${rightId} share ${Math.round(similarity * 100)}% normalized claim vocabulary. Recheck thesis/support territory before publishing both.`,
        })
      }
    }
  }
}

async function listDirectoryNames(dir: string) {
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name)
  } catch {
    return []
  }
}

function parseArgs(argv: string[]) {
  const sourceSlug = argv.find((arg) => !arg.startsWith('--'))
  if (!sourceSlug) {
    throw new Error('Usage: content-carousel self-test <source-slug> [--strict-global]')
  }
  return { sourceSlug, strictGlobal: argv.includes('--strict-global') }
}

function isWeakTitle(value: string) {
  const title = normalize(value)
  if (!title) return true
  if (title.length < 24) return true
  if (/,$/.test(title)) return true
  if (/\b(this|that|it) is (much )?more important\b/i.test(title)) return true
  if (/^(for|to|and|but|or)\b/i.test(title)) return true
  if (/^(i've seen|when you see|if you run)\b/i.test(title) && title.length < 40) return true
  return false
}

function isWeakBriefLine(value: string) {
  const line = normalize(value)
  if (!line) return true
  if (line.length < 28) return true
  if (/,$/.test(line)) return true
  if (/\?$/.test(line)) return true
  if (/\b(right|okay|ok)\??$/.test(line)) return true
  if (/^(i'm going to|get into|we are going to|i've seen|for a|and |but |so )\b/i.test(line) && line.length < 70) return true
  if (/^(this|that|it)\b/.test(line) && line.length < 48) return true
  return false
}

function overlapScore(left: string, right: string) {
  const leftTokens = new Set(tokenize(left))
  const rightTokens = new Set(tokenize(right))
  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0
  }

  let intersection = 0
  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      intersection += 1
    }
  }

  const union = new Set([...leftTokens, ...rightTokens]).size
  return union === 0 ? 0 : intersection / union
}

function tokenize(value: string) {
  return normalize(value)
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 4 && !STOP_WORDS.has(token))
}

const STOP_WORDS = new Set([
  'about', 'after', 'before', 'being', 'from', 'have', 'into', 'just', 'more', 'much', 'that', 'their', 'them', 'then', 'they', 'this', 'what', 'when', 'where', 'which', 'with', 'your', 'yours', 'because', 'really', 'there', 'those', 'these', 'around', 'across', 'while', 'will', 'would', 'could', 'should', 'right', 'going',
])

function normalize(value: string) {
  return value.trim().replace(/^"|"$/g, '').toLowerCase()
}

if (isDirectExecution(import.meta.url) && /self-test\.(t|j)sx?$/.test(process.argv[1] ?? '')) {
  runSelfTestFromArgv().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
