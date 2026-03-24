import { readdir, readFile, rm } from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { isDirectExecution } from './direct-execution'

type SourceManifest = {
  slug?: string
  publishedIdeaIds?: string[]
  droppedBriefs?: Array<{ id?: string; primaryIdeaId?: string; thesis?: string; focusScore?: number; overlapWithEarlierBriefs?: number; overlapWithNearestBriefId?: string; dropReasons?: string[] }>
  carousels?: Array<{ segmentId?: string; slug?: string; title?: string; carouselPath?: string }>
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

const REPO_NAME = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'content-carousel-studio'

type AuditIssue = {
  level: 'error' | 'warn' | 'info'
  code: string
  message: string
}

type SourceAuditResult = {
  sourceSlug: string
  issues: AuditIssue[]
}

type SummaryAuditRecord = {
  carouselCount?: number
  publishedBriefCount: number
  publishedIdeaCount: number
  candidateIdeaCount: number
  rejectedIdeaCount: number
  publishedStatuses: string[]
  candidateStatuses: string[]
  rejectedStatuses: string[]
}

type CarouselAuditRecord = {
  sourceEntry: { segmentId?: string; slug: string; title?: string; carouselPath?: string }
  markdown?: Awaited<ReturnType<typeof readCarousel>>
  missingMarkdown?: boolean
}

export async function runSelfTestFromArgv(argv: string[] = process.argv.slice(2)) {
  const args = parseArgs(argv)

  if (args.repo) {
    if (args.pruneStale) {
      const pruned = await pruneRepoStaleArtifacts()
      if (pruned.length > 0) {
        console.log(`Pruned ${pruned.length} stale artifact director${pruned.length === 1 ? 'y' : 'ies'}:`)
        for (const target of pruned) {
          console.log(`- ${target}`)
        }
      } else {
        console.log('Prune requested, but no stale repo artifacts were found.')
      }
    }

    const issues = await auditRepo()
    printIssueReport('repo', issues)
    if (countIssues(issues).error > 0) {
      process.exitCode = 1
    }
    return
  }

  const issues = await auditSource(args.sourceSlug, { strictGlobal: args.strictGlobal })
  printIssueReport(args.sourceSlug, issues)

  if (countIssues(issues).error > 0) {
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
      .filter((entry): entry is { segmentId?: string; slug: string; title?: string; carouselPath?: string } => Boolean(entry.slug))
      .map(async (entry) => await readCarouselAuditRecord(entry)),
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
    if (publishedIdeas.length === 0 && (source.carousels ?? []).length === 0) {
      const dropSummary = (source.droppedBriefs ?? [])
        .slice(0, 3)
        .map((brief) => {
          const reasons = (brief.dropReasons ?? []).join('; ')
          return brief.thesis ? `“${brief.thesis}” (${reasons || 'no drop reason recorded'})` : reasons
        })
        .filter(Boolean)
        .join(' | ')
      issues.push({
        level: 'info',
        code: 'no-publishable-briefs',
        message: `${sourceSlug} currently has no publishable briefs after quality gating.${dropSummary ? ` Top dropped brief attempts: ${dropSummary}` : ''}`,
      })
    } else {
      issues.push({ level: 'warn', code: 'missing-briefs', message: `${sourceSlug} has no briefs.json records yet.` })
    }
  } else {
    auditBriefs(briefs, issues)
  }

  await auditSummary(sourceDir, { publishedIdeas, candidateIdeas: ideas.filter((idea) => idea.status === 'candidate'), rejectedIdeas: ideas.filter((idea) => idea.status === 'rejected'), briefs, carousels: source.carousels ?? [] }, issues)

  const carouselTitles = new Map<string, string[]>()
  const slideTitles = new Map<string, string[]>()

  for (const { sourceEntry, markdown, missingMarkdown } of carousels) {
    if (missingMarkdown || !markdown) {
      issues.push({
        level: 'error',
        code: 'missing-carousel-markdown',
        message: `${sourceEntry.slug} is listed in source.json but ${sourceEntry.carouselPath ?? `carousels/${sourceEntry.slug}/carousel.md`} is missing. Rebuild the source package before trusting downstream Pages/export output.`,
      })
      continue
    }

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
  const pagesCarouselSlugs = await listDirectoryNames(path.resolve('.pages-serve', REPO_NAME, 'carousel'))
  const staticOutCarouselSlugs = await listDirectoryNames(path.resolve('out', 'carousel'))
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

    for (const slug of pagesCarouselSlugs) {
      if (slug === '.DS_Store') continue
      if (!expectedSlugs.has(slug)) {
        issues.push({ level: 'info', code: 'stale-pages-preview-dir', message: `.pages-serve/${REPO_NAME}/carousel/${slug} exists but is not part of source ${sourceSlug}.` })
      }
    }

    for (const slug of staticOutCarouselSlugs) {
      if (slug === '.DS_Store') continue
      if (!expectedSlugs.has(slug)) {
        issues.push({ level: 'info', code: 'stale-static-route-dir', message: `out/carousel/${slug} exists but is not part of source ${sourceSlug}.` })
      }
    }
  }

  if (issues.length === 0) {
    issues.push({ level: 'info', code: 'clean', message: 'No obvious source/markdown/export drift detected.' })
  }

  return issues
}

async function readCarouselAuditRecord(
  entry: { segmentId?: string; slug: string; title?: string; carouselPath?: string },
): Promise<CarouselAuditRecord> {
  try {
    return {
      sourceEntry: entry,
      markdown: await readCarousel(entry.slug),
    }
  } catch (error) {
    if (isMissingFileError(error)) {
      return {
        sourceEntry: entry,
        missingMarkdown: true,
      }
    }

    throw error
  }
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

async function auditSummary(
  sourceDir: string,
  data: {
    publishedIdeas: Array<Record<string, unknown>>
    candidateIdeas: Array<Record<string, unknown>>
    rejectedIdeas: Array<Record<string, unknown>>
    briefs: BriefRecord[]
    carousels: Array<{ slug?: string }>
  },
  issues: AuditIssue[],
) {
  const summary = await readSummaryAudit(sourceDir)
  if (!summary) {
    issues.push({ level: 'warn', code: 'missing-summary', message: `${path.basename(sourceDir)} is missing summary.md.` })
    return
  }

  const expectedPublishedIdeaCount = data.publishedIdeas.length
  const expectedCandidateCount = Math.min(data.candidateIdeas.length, 5)
  const expectedRejectedCount = Math.min(data.rejectedIdeas.length, 5)

  if (typeof summary.carouselCount === 'number' && summary.carouselCount !== data.carousels.length) {
    issues.push({
      level: 'warn',
      code: 'summary-carousel-count-drift',
      message: `summary.md says carousel count ${summary.carouselCount} but source.json lists ${data.carousels.length}.`,
    })
  }

  if (summary.publishedBriefCount !== data.briefs.length) {
    issues.push({
      level: 'warn',
      code: 'summary-brief-count-drift',
      message: `summary.md lists ${summary.publishedBriefCount} published brief(s) but briefs.json has ${data.briefs.length}.`,
    })
  }

  if (summary.publishedIdeaCount !== expectedPublishedIdeaCount) {
    issues.push({
      level: 'warn',
      code: 'summary-published-idea-count-drift',
      message: `summary.md lists ${summary.publishedIdeaCount} published idea(s) but ideas.json has ${expectedPublishedIdeaCount}.`,
    })
  }

  if (summary.candidateIdeaCount !== expectedCandidateCount) {
    issues.push({
      level: 'warn',
      code: 'summary-candidate-count-drift',
      message: `summary.md lists ${summary.candidateIdeaCount} candidate idea(s) but the summary should show ${expectedCandidateCount}.`,
    })
  }

  if (summary.rejectedIdeaCount !== expectedRejectedCount) {
    issues.push({
      level: 'warn',
      code: 'summary-rejected-count-drift',
      message: `summary.md lists ${summary.rejectedIdeaCount} rejected idea(s) but the summary should show ${expectedRejectedCount}.`,
    })
  }

  const wrongPublishedStatuses = summary.publishedStatuses.filter((status) => status !== 'published')
  if (wrongPublishedStatuses.length > 0) {
    issues.push({
      level: 'warn',
      code: 'summary-published-status-drift',
      message: `summary.md published-ideas section includes non-published statuses: ${wrongPublishedStatuses.join(', ')}.`,
    })
  }

  const wrongCandidateStatuses = summary.candidateStatuses.filter((status) => status !== 'candidate')
  if (wrongCandidateStatuses.length > 0) {
    issues.push({
      level: 'warn',
      code: 'summary-candidate-status-drift',
      message: `summary.md candidate section includes non-candidate statuses: ${wrongCandidateStatuses.join(', ')}.`,
    })
  }

  const wrongRejectedStatuses = summary.rejectedStatuses.filter((status) => status !== 'rejected')
  if (wrongRejectedStatuses.length > 0) {
    issues.push({
      level: 'warn',
      code: 'summary-rejected-status-drift',
      message: `summary.md rejected section includes non-rejected statuses: ${wrongRejectedStatuses.join(', ')}.`,
    })
  }
}

async function readSummaryAudit(sourceDir: string) {
  try {
    const raw = await readFile(path.join(sourceDir, 'summary.md'), 'utf8')
    return parseSummaryAudit(raw)
  } catch {
    return undefined
  }
}

function parseSummaryAudit(raw: string): SummaryAuditRecord {
  return {
    carouselCount: parseCarouselCount(raw),
    publishedBriefCount: countSectionEntries(raw, 'Published briefs'),
    publishedIdeaCount: countSectionEntries(raw, 'Published ideas'),
    candidateIdeaCount: countSectionEntries(raw, 'Candidate ideas not published this run'),
    rejectedIdeaCount: countSectionEntries(raw, 'Rejected ideas'),
    publishedStatuses: extractSectionStatuses(raw, 'Published ideas'),
    candidateStatuses: extractSectionStatuses(raw, 'Candidate ideas not published this run'),
    rejectedStatuses: extractSectionStatuses(raw, 'Rejected ideas'),
  }
}

function parseCarouselCount(raw: string) {
  const match = raw.match(/- Carousel count:\s*(\d+)/)
  return match ? Number(match[1]) : undefined
}

function countSectionEntries(raw: string, title: string) {
  const section = getSummarySection(raw, title)
  if (!section) return 0
  return (section.match(/^###\s+/gm) ?? []).length
}

function extractSectionStatuses(raw: string, title: string) {
  const section = getSummarySection(raw, title)
  if (!section) return []
  return [...section.matchAll(/- Status:\s*([^\n]+)/g)].map((match) => normalize(match[1]))
}

function getSummarySection(raw: string, title: string) {
  const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = raw.match(new RegExp(`## ${escapedTitle}\\n([\\s\\S]*?)(?=\\n## |$)`))
  return match?.[1] ?? ''
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

    if (isRedundantWhyLine(thesis, whyItMatters)) {
      const suggestedWhy = suggestReplacementWhy(thesis, supportPoints)
      issues.push({
        level: 'warn',
        code: 'redundant-brief-why',
        message: suggestedWhy
          ? `${briefId} has a why-it-matters line that mostly repeats the thesis: "${whyItMatters}". Best available support-line replacement: "${suggestedWhy}"`
          : `${briefId} has a why-it-matters line that mostly repeats the thesis: "${whyItMatters}"`,
      })
    }

    if (supportPoints.length < 2) {
      issues.push({ level: 'warn', code: 'thin-brief-support', message: `${briefId} only has ${supportPoints.length} support point(s).` })
    }

    for (const supportPoint of supportPoints) {
      if (isWeakBriefLine(supportPoint)) {
        issues.push({ level: 'warn', code: 'weak-brief-support', message: `${briefId} has a weak support point: "${supportPoint}"` })
      }
    }

    const focus = briefSemanticFocus(thesis, whyItMatters, supportPoints)
    if (focus.checked && focus.score < 0.14) {
      issues.push({
        level: 'warn',
        code: 'diffuse-brief-focus',
        message: `${briefId} looks semantically diffuse (focus ${focus.score.toFixed(2)}). Thesis/support may be too broad for a single carousel.`,
      })
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

async function listSourceSlugs() {
  return (await listDirectoryNames(path.resolve('sources'))).filter((name) => name !== '.DS_Store').sort()
}

async function auditRepo() {
  const sourceSlugs = await listSourceSlugs()
  const sourceResults: SourceAuditResult[] = []

  for (const sourceSlug of sourceSlugs) {
    sourceResults.push({ sourceSlug, issues: await auditSource(sourceSlug) })
  }

  const issues: AuditIssue[] = []
  const expectedCarouselSlugs = new Set<string>()
  const carouselTitleOwners = new Map<string, string[]>()
  const slideTitleOwners = new Map<string, string[]>()

  for (const result of sourceResults) {
    const meaningfulIssues = result.issues.filter((issue) => issue.code !== 'clean')
    if (meaningfulIssues.length === 0) {
      issues.push({ level: 'info', code: 'source-clean', message: `${result.sourceSlug} is clean.` })
    } else {
      const counts = countIssues(meaningfulIssues)
      issues.push({
        level: counts.error > 0 ? 'error' : counts.warn > 0 ? 'warn' : 'info',
        code: 'source-summary',
        message: `${result.sourceSlug} → errors ${counts.error}, warnings ${counts.warn}, notes ${counts.info}`,
      })
      for (const issue of meaningfulIssues) {
        issues.push({ level: issue.level, code: `${result.sourceSlug}:${issue.code}`, message: issue.message })
      }
    }

    const source = await readSourceManifest(result.sourceSlug)
    for (const entry of source.carousels ?? []) {
      if (!entry.slug) continue
      expectedCarouselSlugs.add(entry.slug)
      const record = await readCarouselAuditRecord({ slug: entry.slug, title: entry.title, carouselPath: entry.carouselPath, segmentId: entry.segmentId })
      if (record.missingMarkdown || !record.markdown) continue

      const carouselTitleKey = record.markdown.title.toLowerCase()
      carouselTitleOwners.set(carouselTitleKey, [...(carouselTitleOwners.get(carouselTitleKey) ?? []), record.markdown.slug])
      for (const slide of record.markdown.slides) {
        const slideKey = slide.title.toLowerCase()
        slideTitleOwners.set(slideKey, [...(slideTitleOwners.get(slideKey) ?? []), `${record.markdown.slug}#${slide.id}`])
      }
    }
  }

  addRepoDuplicateIssues(issues, carouselTitleOwners, slideTitleOwners)
  await addRepoStaleArtifactIssues(issues, expectedCarouselSlugs)

  if (issues.length === 0) {
    issues.push({ level: 'info', code: 'clean', message: 'No obvious repo-wide source/export/staging drift detected.' })
  }

  return issues
}

async function readSourceManifest(sourceSlug: string) {
  const raw = await readFile(path.resolve('sources', sourceSlug, 'source.json'), 'utf8')
  return JSON.parse(raw) as SourceManifest
}

async function addRepoStaleArtifactIssues(issues: AuditIssue[], expectedCarouselSlugs: Set<string>) {
  for (const target of await collectRepoArtifactTargets()) {
    for (const name of target.names) {
      if (name === '.DS_Store') continue
      if (!expectedCarouselSlugs.has(name)) {
        const message = target.code === 'stale-next-route-artifact'
          ? `${target.prefix}/${name} still exists in the local Next build cache even though no source package references it. Re-run ./content-carousel build-pages to cold-rebuild staging.`
          : `${target.prefix}/${name} exists but is not referenced by any source package.`
        issues.push({ level: 'info', code: target.code, message })
      }
    }
  }
}

async function pruneRepoStaleArtifacts() {
  const sourceSlugs = await listSourceSlugs()
  const expectedCarouselSlugs = new Set<string>()

  for (const sourceSlug of sourceSlugs) {
    const source = await readSourceManifest(sourceSlug)
    for (const entry of source.carousels ?? []) {
      if (entry.slug) {
        expectedCarouselSlugs.add(entry.slug)
      }
    }
  }

  const pruned: string[] = []

  for (const target of await collectRepoArtifactTargets()) {
    for (const name of target.names) {
      if (name === '.DS_Store') continue
      if (expectedCarouselSlugs.has(name)) continue

      const fullPath = path.resolve(target.prefix, name)
      await rm(fullPath, { recursive: true, force: true })
      pruned.push(`${target.prefix}/${name}`)
    }
  }

  return pruned.sort()
}

async function collectRepoArtifactTargets() {
  return [
    { code: 'stale-carousel-dir', prefix: 'carousels', names: await listDirectoryNames(path.resolve('carousels')) },
    { code: 'stale-export-dir', prefix: 'public/exports', names: await listDirectoryNames(path.resolve('public', 'exports')) },
    { code: 'stale-pages-preview-dir', prefix: `.pages-serve/${REPO_NAME}/carousel`, names: await listDirectoryNames(path.resolve('.pages-serve', REPO_NAME, 'carousel')) },
    { code: 'stale-static-route-dir', prefix: 'out/carousel', names: await listDirectoryNames(path.resolve('out', 'carousel')) },
    { code: 'stale-next-route-artifact', prefix: '.next/server/app/carousel', names: await listNextRouteArtifactSlugs(path.resolve('.next', 'server', 'app', 'carousel')) },
  ]
}

async function listNextRouteArtifactSlugs(dir: string) {
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    const names = new Set<string>()

    for (const entry of entries) {
      if (entry.name === '.DS_Store' || entry.name === '[slug]') continue
      if (entry.isDirectory()) {
        names.add(entry.name)
        continue
      }
      if (!entry.isFile()) continue

      const match = entry.name.match(/^(.*?)(?:\.(?:html|meta|rsc|prefetch\.rsc|txt|json))$/)
      if (match?.[1]) {
        names.add(match[1])
      }
    }

    return [...names].sort()
  } catch {
    return []
  }
}

function addRepoDuplicateIssues(issues: AuditIssue[], carouselTitleOwners: Map<string, string[]>, slideTitleOwners: Map<string, string[]>) {
  for (const [title, slugs] of carouselTitleOwners) {
    if (title && slugs.length > 1) {
      issues.push({ level: 'error', code: 'duplicate-carousel-title-repo', message: `Duplicate carousel title across repo: ${slugs.join(', ')}` })
    }
  }

  for (const [title, refs] of slideTitleOwners) {
    if (title && refs.length > 1) {
      issues.push({ level: 'warn', code: 'duplicate-slide-title-repo', message: `Duplicate slide title across repo ("${title}"): ${refs.join(', ')}` })
    }
  }
}

function countIssues(issues: AuditIssue[]) {
  return issues.reduce(
    (acc, issue) => {
      acc[issue.level] += 1
      return acc
    },
    { error: 0, warn: 0, info: 0 },
  )
}

function printIssueReport(label: string, issues: AuditIssue[]) {
  const counts = countIssues(issues)
  console.log(`Self-test: ${label}`)
  console.log(`Errors: ${counts.error}  Warnings: ${counts.warn}  Notes: ${counts.info}`)

  for (const issue of issues) {
    const prefix = issue.level === 'error' ? 'ERROR' : issue.level === 'warn' ? 'WARN ' : 'INFO '
    console.log(`${prefix} [${issue.code}] ${issue.message}`)
  }
}

function parseArgs(argv: string[]) {
  const repo = argv.includes('--repo') || argv.includes('--all')
  const pruneStale = argv.includes('--prune-stale')
  const sourceSlug = argv.find((arg) => !arg.startsWith('--'))
  if (!repo && !sourceSlug) {
    throw new Error('Usage: content-carousel self-test <source-slug> [--strict-global] | content-carousel self-test --repo [--prune-stale]')
  }
  if (pruneStale && !repo) {
    throw new Error('--prune-stale is only supported together with --repo')
  }
  return { sourceSlug: sourceSlug ?? '', strictGlobal: argv.includes('--strict-global'), repo, pruneStale }
}

function isWeakTitle(value: string) {
  const title = normalize(value)
  if (!title) return true
  if (title.length < 24) return true
  if (/,$/.test(title)) return true
  if (/\b(this|that|it) is (much )?more important\b/i.test(title)) return true
  if (/^(for|to|and|but|or)\b/i.test(title)) return true
  if (/^(i've seen|when you see|if you run)\b/i.test(title) && title.length < 40) return true
  if (isTranscriptLeadInLine(title)) return true
  if (isMetaNarrationLine(title)) return true
  return false
}

function isWeakBriefLine(value: string) {
  const line = normalize(value)
  if (!line) return true
  if (line.length < 28) return true
  if (line.length > 180) return true
  if (/,$/.test(line)) return true
  if (/\?$/.test(line)) return true
  if (/\b(right|okay|ok)\??$/.test(line)) return true
  if (/^(i'm going to|get into|we are going to|i've seen|for a|and |but |so |now|starting fresh|well,?\s+(one|first)|also true of)\b/i.test(line) && line.length < 90) return true
  if (/\bby the way\b/i.test(line)) return true
  if (isTranscriptLeadInLine(line)) return true
  if (isMetaNarrationLine(line)) return true
  if (isFragmentaryBriefLine(line)) return true
  if (/^(this|that|it)\b/.test(line) && line.length < 48) return true
  return false
}

function isFragmentaryBriefLine(value: string) {
  const line = normalize(value)
  if (!line) return true

  const wordCount = line.split(/\s+/).filter(Boolean).length
  const hasTerminalPunctuation = /[.!?]$/.test(line)
  const startsConditional = /^(if|when|where|while|because|as|whether|which|that)\b/i.test(line)

  if (startsConditional && !hasTerminalPunctuation) return true
  if (startsConditional && !/,/.test(line) && wordCount < 14) return true
  if (/^(every|any|some|many|most)\s+\w+(?:\s+\w+){0,4}$/i.test(line) && !hasTerminalPunctuation) return true
  if (/^(maintains?|maintaining|letting|using|building|triaging|calibrating)\b/i.test(line) && !hasTerminalPunctuation) return true
  if (!hasTerminalPunctuation && wordCount < 7) return true
  if (!hasTerminalPunctuation && wordCount < 11 && !/\b(is|are|was|were|be|being|been|have|has|had|do|does|did|can|could|will|would|should|must|need|means|makes|keeps|goes|lets|helps|shifts|changes|replaces|solves|matters|works|fails)\b/i.test(line)) return true

  return false
}

function isMetaNarrationLine(value: string) {
  return /^(this is (a )?(video|podcast|episode) about|in this (video|podcast|episode)|the point of this (video|podcast|episode)|this is not about learning to code|that is the skill of \d{4})\b/i.test(value)
    || isDemoReferenceLine(value)
}

function isTranscriptLeadInLine(value: string) {
  const line = normalize(value)
  if (!line) return true

  if (/^(so|also|and|but|well|now|today|this week)[,\s]/i.test(line) && line.length < 120) {
    return true
  }

  if (/^(so|also|now)[,\s].*\b(this|these|it)\s+(is|are)\b/i.test(line)) {
    return true
  }

  if (/\b(one of them is called|this ai is called|these are called|flagship foundation model|optimized for|currently \w+\d|\bv\d+(?:\.\d+)?\b)\b/i.test(line)) {
    return true
  }

  return false
}

function isDemoReferenceLine(value: string) {
  return /^(here (you can|are)|if you (click|look|scroll)|if you('| a)?re interested|i('| wi)?ll link|link to this|for your reference|the description below|this main page|the full chat|here's the github repo|here are some specs|here are some additional examples|click on this demo link|interested in reading further)\b/i.test(value)
    || /\b(i('| wi)?ll link to this page|description below|for your reference)\b/i.test(value)
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

function countSharedTokens(left: string, right: string) {
  const leftTokens = new Set(tokenize(left))
  const rightTokens = new Set(tokenize(right))
  let shared = 0
  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      shared += 1
    }
  }
  return shared
}

function briefSemanticFocus(thesis: string, whyItMatters: string, supportPoints: string[]) {
  const supportLines = supportPoints.filter(Boolean)
  const anchor = [thesis, whyItMatters].filter(Boolean).join(' ')
  if (!anchor || supportLines.length === 0) {
    return { checked: false, score: 0 }
  }

  const supportScores = supportLines.map((line) => overlapScore(thesis, line) + Math.min(countSharedTokens(thesis, line), 4) * 0.08)
  const whyScore = whyItMatters ? overlapScore(thesis, whyItMatters) + Math.min(countSharedTokens(thesis, whyItMatters), 4) * 0.06 : 0
  const averageSupport = supportScores.reduce((sum, score) => sum + score, 0) / supportScores.length
  const anchorScore = overlapScore(anchor, supportLines.join(' '))

  return {
    checked: true,
    score: averageSupport * 0.7 + anchorScore * 0.2 + whyScore * 0.1,
  }
}

function isRedundantWhyLine(thesis: string, whyItMatters: string) {
  const thesisNormalized = normalize(thesis)
  const whyNormalized = normalize(whyItMatters)
  if (!thesisNormalized || !whyNormalized) return false
  if (thesisNormalized === whyNormalized) return true
  if (thesisNormalized.includes(whyNormalized) || whyNormalized.includes(thesisNormalized)) return true
  return overlapScore(thesisNormalized, whyNormalized) >= 0.9
}

function suggestReplacementWhy(thesis: string, supportPoints: string[]) {
  return [...supportPoints]
    .filter(Boolean)
    .filter((line) => !isWeakBriefLine(line))
    .filter((line) => !isRedundantWhyLine(thesis, line))
    .sort((left, right) => scoreWhyReplacement(thesis, right) - scoreWhyReplacement(thesis, left) || right.length - left.length)[0]
}

function scoreWhyReplacement(thesis: string, candidate: string) {
  let score = overlapScore(thesis, candidate) + Math.min(countSharedTokens(thesis, candidate), 4) * 0.08

  if (/\b(because|so|which means|that means|this means|therefore|instead|forces?|turns?|makes?|lets?|allows?|deletes?|removes?|changes?|shifts?|breaks?|collapses?|evaporates?|disappear|cost|overhead|handoff|handoffs|coordination|workflow|execution|calendar|meetings?|structure|layer)\b/i.test(candidate)) {
    score += 0.35
  }

  if (/\b(if you are|the [a-z\- ]+ is the value)\b/i.test(candidate)) {
    score -= 0.2
  }

  return score
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

function isMissingFileError(error: unknown) {
  return Boolean(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')
}

if (isDirectExecution(import.meta.url) && /self-test\.(t|j)sx?$/.test(process.argv[1] ?? '')) {
  runSelfTestFromArgv().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
