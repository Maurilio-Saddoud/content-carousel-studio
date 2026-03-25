import { execFile } from 'node:child_process'
import { access, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { promisify } from 'node:util'
import path from 'node:path'
import matter from 'gray-matter'
import { syncCarouselDirectoryIndex } from '@/lib/carousels'

type TranscriptLine = {
  timestamp: string
  seconds: number
  text: string
}

type SegmentScoreBreakdown = {
  hookWords: number
  contrast: number
  specificity: number
  structure: number
  question: number
  credibility: number
  clarity: number
  openingStrength: number
  density: number
  fillerPenalty: number
  lyricPenalty: number
  repetitionPenalty: number
  fragmentPenalty: number
  introOutroPenalty: number
  lengthPenalty: number
}

type Segment = {
  id: string
  rank: number
  score: number
  start: string
  end: string
  durationSeconds: number
  lineStart: number
  lineEnd: number
  wordCount: number
  text: string
  titleSuggestion: string
  hook: string
  whyItCouldWork: string[]
  scoreBreakdown: SegmentScoreBreakdown
}

type IdeaStatus = 'published' | 'candidate' | 'rejected'

type Idea = Segment & {
  status: IdeaStatus
  selectionReason: string
  rejectionReasons: string[]
  duplicateOf?: string
  carouselSlug?: string
}

type VideoMetadata = {
  title: string
  authorName?: string
  authorUrl?: string
  thumbnailUrl?: string
}

type CarouselSlide = {
  id: string
  eyebrow?: string
  title: string
  body: string
}

type Carousel = {
  slug: string
  title: string
  description: string
  sourceType: 'transcript'
  aspectRatio: 'portrait'
  updatedAt: string
  theme: {
    accent: string
    background: string
    foreground: string
    muted: string
  }
  slides: CarouselSlide[]
}

type CarouselDirectoryItem = Omit<Carousel, 'slides'>

type BriefScorecard = {
  themeStrength: number
  authorityPotential: number
  clarity: number
  distinctness: number
  commercialRelevance: number
  fidelity: number
  total: number
}

type EditorialCritique = {
  status: 'accept' | 'rewrite'
  reasons: string[]
  rewriteGoals: string[]
}

type Brief = {
  id: string
  primaryIdeaId: string
  supportingIdeaIds: string[]
  thesis: string
  audience: string
  whyItMatters: string
  supportPoints: string[]
  distinctFromBriefIds: string[]
  scorecard: BriefScorecard
  critique: EditorialCritique
  carouselSlug?: string
}

type CarouselBundle = {
  brief: Brief
  idea: Idea
  carousel: Carousel
  critique: EditorialCritique
}

type ExistingSlugMap = Record<string, string>
type TitleReservationOptions = {
  excludeCarouselSlugs?: Set<string>
}
type SourceManifest = {
  slug?: string
  sourceType?: string
  sourceUrl?: string
  fetchedAt?: string
  transcriptMode?: string
  whisperModel?: string
  video?: VideoMetadata
  transcriptLineCount?: number
  defaultBehavior?: string
  ideaRule?: {
    publishLimit?: number
    threshold?: string
  }
  ideaCount?: number
  briefCount?: number
  publishedIdeaIds?: string[]
  createdFiles?: string[]
  selectedSegmentIds?: string[]
  briefs?: Array<{ id?: string; primaryIdeaId?: string; thesis?: string; slug?: string }>
  carousels?: Array<{ segmentId?: string; slug?: string; title?: string; previewPath?: string; carouselPath?: string }>
}

const TRANSCRIPT_TOOL_PATH = path.resolve('../youtube-transcript-v1/yt_transcript.py')
const RAW_TRANSCRIPT_RE = /^\[(\d{2}):(\d{2}):(\d{2})\]\s+(.*)$/
const execFileAsync = promisify(execFile)
const REPO_NAME = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'content-carousel-studio'
const MIN_CAROUSEL_SLIDES = 5
const MAX_CAROUSEL_SLIDES = 8
const TARGET_BODY_LINES = 3
const DEFAULT_THEME = {
  accent: '#1D9BF0',
  background: '#000000',
  foreground: '#E7E9EA',
  muted: '#71767B',
}

export async function ingestYoutubeFromArgv(argv: string[] = process.argv.slice(2)) {
  const args = parseArgs(argv)
  if (!args.url) {
    printUsageAndExit()
  }

  const metadata = await fetchVideoMetadata(args.url)
  const sourceSlug = args.slug ?? slugify(metadata.title || args.url)
  const sourceDir = path.resolve('sources', sourceSlug)

  await mkdir(sourceDir, { recursive: true })

  const { transcript, transcriptMode } = await fetchTranscript(args.url, args.whisperModel)
  const transcriptLines = parseTranscript(transcript)

  if (transcriptLines.length === 0) {
    throw new Error('Transcript fetch succeeded but returned zero timestamped lines.')
  }

  const cleanTranscript = buildCleanTranscript(transcriptLines)
  const rankedSegments = rankSegments(segmentTranscript(transcriptLines))
  const previousManifest = await readSourceManifest(sourceDir)
  const existingSlugs = Object.fromEntries(
    (previousManifest?.carousels ?? [])
      .map((entry) => [entry.segmentId, entry.slug])
      .filter((entry): entry is [string, string] => Boolean(entry[0] && entry[1])),
  )
  const ideas = buildIdeas(rankedSegments, sourceSlug, args.maxSegments, existingSlugs)
  const publishedIdeas = ideas.filter((idea) => idea.status === 'published')

  if (publishedIdeas.length === 0) {
    throw new Error('Could not find any usable transcript segments after editorial filtering.')
  }

  const briefs = buildBriefs(publishedIdeas, ideas, sourceSlug, existingSlugs)
  const repoTitleReservations = await collectRepoTitleReservations(sourceSlug, {
    excludeCarouselSlugs: new Set(Object.values(existingSlugs)),
  })
  const carouselBundles = buildCarouselBundles(metadata, sourceSlug, briefs, ideas, repoTitleReservations)
  const acceptedIdeaIds = carouselBundles.map((bundle) => bundle.idea.id)
  const normalizedIdeas: Idea[] = ideas.map((idea) => acceptedIdeaIds.includes(idea.id)
    ? idea
    : idea.status === 'published'
      ? { ...idea, status: 'candidate' as const, selectionReason: `${idea.selectionReason} Dropped after brief-overlap filtering.`.trim() }
      : idea)
  await removeStalePublishedArtifacts(previousManifest?.carousels ?? [], carouselBundles)

  for (const bundle of carouselBundles) {
    await mkdir(path.resolve('carousels', bundle.carousel.slug), { recursive: true })
    await writeFile(path.resolve('carousels', bundle.carousel.slug, 'carousel.md'), renderCarouselMarkdown(bundle.carousel), 'utf8')
  }
  await invalidateRenderedArtifacts(carouselBundles.map((bundle) => bundle.carousel.slug))
  await syncCarouselDirectoryIndex()

  const summary = buildSummary(metadata, sourceSlug, carouselBundles, normalizedIdeas, briefs)

  const sourceManifest = {
    slug: sourceSlug,
    sourceType: 'transcript',
    sourceUrl: args.url,
    fetchedAt: new Date().toISOString(),
    transcriptMode,
    whisperModel: args.whisperModel,
    video: metadata,
    transcriptLineCount: transcriptLines.length,
    defaultBehavior: 'creates source artifacts, ranks candidate ideas, and publishes markdown carousels only for selected ideas',
    ideaRule: {
      publishLimit: args.maxSegments,
      threshold: 'Ideas must pass the editorial filter (score >= 4, 28-155 words, at least 2 full sentences, no obvious intro/outro junk, no near-duplicates).',
    },
    ideaCount: normalizedIdeas.length,
    briefCount: briefs.length,
    publishedIdeaIds: acceptedIdeaIds,
    briefs: briefs.map((brief) => ({
      id: brief.id,
      primaryIdeaId: brief.primaryIdeaId,
      thesis: brief.thesis,
      slug: brief.carouselSlug,
    })),
    carousels: carouselBundles.map((bundle) => ({
      slug: bundle.carousel.slug,
      segmentId: bundle.idea.id,
      title: bundle.carousel.title,
      previewPath: `/carousel/${bundle.carousel.slug}`,
      carouselPath: `carousels/${bundle.carousel.slug}/carousel.md`,
    })),
    createdFiles: [
      `sources/${sourceSlug}/source.json`,
      `sources/${sourceSlug}/raw-transcript.md`,
      `sources/${sourceSlug}/clean-transcript.md`,
      `sources/${sourceSlug}/segments.json`,
      `sources/${sourceSlug}/ideas.json`,
      `sources/${sourceSlug}/briefs.json`,
      `sources/${sourceSlug}/summary.md`,
      ...carouselBundles.map((bundle) => `carousels/${bundle.carousel.slug}/carousel.md`),
      'carousels/index.json',
    ],
  }

  await writeFile(path.join(sourceDir, 'source.json'), `${JSON.stringify(sourceManifest, null, 2)}\n`, 'utf8')
  await writeFile(path.join(sourceDir, 'raw-transcript.md'), renderRawTranscript(metadata, args.url, transcript), 'utf8')
  await writeFile(path.join(sourceDir, 'clean-transcript.md'), renderCleanTranscript(metadata, cleanTranscript), 'utf8')
  await writeFile(path.join(sourceDir, 'segments.json'), `${JSON.stringify(rankedSegments, null, 2)}\n`, 'utf8')
  await writeFile(path.join(sourceDir, 'ideas.json'), `${JSON.stringify(normalizedIdeas, null, 2)}\n`, 'utf8')
  await writeFile(path.join(sourceDir, 'briefs.json'), `${JSON.stringify(briefs, null, 2)}\n`, 'utf8')
  await writeFile(path.join(sourceDir, 'summary.md'), summary, 'utf8')

  console.log(`Created transcript package and ${carouselBundles.length} carousel${carouselBundles.length === 1 ? '' : 's'} for ${sourceSlug}`)
  for (const file of sourceManifest.createdFiles) {
    console.log(`- ${file}`)
  }

}

export async function rebuildCarouselsFromSourceArgv(argv: string[] = process.argv.slice(2)) {
  const args = parseRebuildArgs(argv)
  const sourceSlug = args.sourceSlug
  if (!sourceSlug) {
    throw new Error('Usage: content-carousel rebuild-source <source-slug> [--max-segments 8]')
  }

  const sourceDir = path.resolve('sources', sourceSlug)
  const sourceManifestRaw = await readFile(path.join(sourceDir, 'source.json'), 'utf8')
  const sourceManifest = JSON.parse(sourceManifestRaw) as SourceManifest
  const segmentsRaw = await readFile(path.join(sourceDir, 'segments.json'), 'utf8')
  const segments = refreshSegmentSuggestions(JSON.parse(segmentsRaw) as Segment[])
  const metadata = sourceManifest.video

  if (!metadata?.title) {
    throw new Error(`Source package ${sourceSlug} is missing video metadata in sources/${sourceSlug}/source.json`)
  }

  const existingSlugs = Object.fromEntries(
    (sourceManifest.carousels ?? [])
      .map((entry) => [entry.segmentId, entry.slug])
      .filter((entry): entry is [string, string] => Boolean(entry[0] && entry[1])),
  )
  const publishLimit = args.maxSegments
    ?? sourceManifest.ideaRule?.publishLimit
    ?? sourceManifest.publishedIdeaIds?.length
    ?? (sourceManifest.carousels?.length || 0)
    ?? 8
  const ideas = buildIdeas(segments, sourceSlug, publishLimit, existingSlugs)
  const publishedIdeas = ideas.filter((idea) => idea.status === 'published')
  const briefs = buildBriefs(publishedIdeas, ideas, sourceSlug, existingSlugs)
  const repoTitleReservations = await collectRepoTitleReservations(sourceSlug, {
    excludeCarouselSlugs: new Set(Object.values(existingSlugs)),
  })
  const carouselBundles = buildCarouselBundles(metadata, sourceSlug, briefs, ideas, repoTitleReservations)
  const acceptedIdeaIds = carouselBundles.map((bundle) => bundle.idea.id)
  const normalizedIdeas: Idea[] = ideas.map((idea) => acceptedIdeaIds.includes(idea.id)
    ? idea
    : idea.status === 'published'
      ? { ...idea, status: 'candidate' as const, selectionReason: `${idea.selectionReason} Dropped after brief-overlap filtering.`.trim() }
      : idea)
  await removeStalePublishedArtifacts(sourceManifest.carousels ?? [], carouselBundles)
  await writeFile(path.join(sourceDir, 'segments.json'), `${JSON.stringify(segments, null, 2)}\n`, 'utf8')
  await writeFile(path.join(sourceDir, 'ideas.json'), `${JSON.stringify(normalizedIdeas, null, 2)}\n`, 'utf8')
  await writeFile(path.join(sourceDir, 'briefs.json'), `${JSON.stringify(briefs, null, 2)}\n`, 'utf8')

  for (const bundle of carouselBundles) {
    await mkdir(path.resolve('carousels', bundle.carousel.slug), { recursive: true })
    await writeFile(path.resolve('carousels', bundle.carousel.slug, 'carousel.md'), renderCarouselMarkdown(bundle.carousel), 'utf8')
  }
  await invalidateRenderedArtifacts(carouselBundles.map((bundle) => bundle.carousel.slug))
  await syncCarouselDirectoryIndex()
  await writeFile(path.join(sourceDir, 'source.json'), `${JSON.stringify({
    slug: sourceSlug,
    sourceType: sourceManifest.sourceType ?? 'transcript',
    sourceUrl: sourceManifest.sourceUrl,
    fetchedAt: sourceManifest.fetchedAt,
    transcriptMode: sourceManifest.transcriptMode,
    whisperModel: sourceManifest.whisperModel,
    video: sourceManifest.video,
    transcriptLineCount: sourceManifest.transcriptLineCount,
    defaultBehavior: 'creates source artifacts, ranks candidate ideas, promotes distinct briefs, and publishes markdown carousels from those briefs',
    ideaCount: normalizedIdeas.length,
    briefCount: briefs.length,
    publishedIdeaIds: acceptedIdeaIds,
    ideaRule: {
      publishLimit,
      threshold: 'Ideas must pass the editorial filter (score >= 4, 28-155 words, at least 2 full sentences, no obvious intro/outro junk, no near-duplicates).',
    },
    briefs: briefs.map((brief) => ({
      id: brief.id,
      primaryIdeaId: brief.primaryIdeaId,
      thesis: brief.thesis,
      slug: brief.carouselSlug,
    })),
    carousels: carouselBundles.map((bundle) => ({
      slug: bundle.carousel.slug,
      segmentId: bundle.idea.id,
      title: bundle.carousel.title,
      previewPath: `/carousel/${bundle.carousel.slug}`,
      carouselPath: `carousels/${bundle.carousel.slug}/carousel.md`,
    })),
    createdFiles: [
      `sources/${sourceSlug}/source.json`,
      `sources/${sourceSlug}/raw-transcript.md`,
      `sources/${sourceSlug}/clean-transcript.md`,
      `sources/${sourceSlug}/segments.json`,
      `sources/${sourceSlug}/ideas.json`,
      `sources/${sourceSlug}/briefs.json`,
      `sources/${sourceSlug}/summary.md`,
      ...carouselBundles.map((bundle) => `carousels/${bundle.carousel.slug}/carousel.md`),
      'carousels/index.json',
    ],
  }, null, 2)}\n`, 'utf8')
  await writeFile(path.join(sourceDir, 'summary.md'), buildSummary(metadata, sourceSlug, carouselBundles, ideas, briefs), 'utf8')

  console.log(`Rebuilt ${carouselBundles.length} carousel${carouselBundles.length === 1 ? '' : 's'} for ${sourceSlug}`)
}


export async function syncSourceManifestFromArgv(argv: string[] = process.argv.slice(2)) {
  const args = parseSyncSourceArgs(argv)
  const targetSlugs = args.repo
    ? await listSourceSlugs()
    : args.sourceSlug
      ? [args.sourceSlug]
      : []

  if (targetSlugs.length === 0) {
    throw new Error('Usage: content-carousel sync-source <source-slug> | content-carousel sync-source --repo')
  }

  for (const sourceSlug of targetSlugs) {
    await syncSourceManifest(sourceSlug)
  }
}

async function syncSourceManifest(sourceSlug: string) {
  const sourceDir = path.resolve('sources', sourceSlug)
  const sourceManifestRaw = await readFile(path.join(sourceDir, 'source.json'), 'utf8')
  const sourceManifest = JSON.parse(sourceManifestRaw) as SourceManifest
  const metadata = sourceManifest.video

  if (!metadata?.title) {
    throw new Error(`Source package ${sourceSlug} is missing video metadata in sources/${sourceSlug}/source.json`)
  }

  const ideas = JSON.parse(await readFile(path.join(sourceDir, 'ideas.json'), 'utf8')) as Idea[]
  const briefs = JSON.parse(await readFile(path.join(sourceDir, 'briefs.json'), 'utf8')) as Brief[]
  const survivingCarouselEntries = await Promise.all((sourceManifest.carousels ?? []).map(async (entry) => {
    const slug = entry.slug
    if (!slug) return undefined
    const markdown = await readCarouselMarkdown(slug)
    if (!markdown) return undefined
    return {
      slug,
      segmentId: entry.segmentId,
      title: markdown.title,
      previewPath: `/carousel/${slug}`,
      carouselPath: `carousels/${slug}/carousel.md`,
    }
  }))
  const carousels = survivingCarouselEntries.filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
  const survivingSlugs = new Set(carousels.map((entry) => entry.slug))
  const survivingSegmentIds = new Set(carousels.map((entry) => entry.segmentId).filter((id): id is string => Boolean(id)))
  const syncedBriefs = briefs
    .filter((brief) => brief.carouselSlug && survivingSlugs.has(brief.carouselSlug))
    .map((brief) => ({
      ...brief,
      audience: brief.audience ?? 'Operators building AI-enabled products or workflows.',
      whyItMatters: brief.whyItMatters ?? 'Recovered during sync-source from surviving carousel markdown.',
      supportPoints: Array.isArray(brief.supportPoints) ? brief.supportPoints : [],
      distinctFromBriefIds: Array.isArray(brief.distinctFromBriefIds) ? brief.distinctFromBriefIds : [],
      scorecard: brief.scorecard ?? {
        themeStrength: 0,
        authorityPotential: 0,
        clarity: 0,
        distinctness: 0,
        commercialRelevance: 0,
        fidelity: 0,
        total: 0,
      },
      critique: brief.critique ?? {
        status: 'accept' as const,
        reasons: ['Recovered during sync-source from surviving carousel markdown.'],
        rewriteGoals: ['Rebuild this source package if you want a fresh editorial critique.'],
      },
    }))
  const syncedBriefEntries = syncedBriefs.map((brief) => ({
    id: brief.id,
    primaryIdeaId: brief.primaryIdeaId,
    thesis: brief.thesis,
    slug: brief.carouselSlug,
  }))
  const syncedPublishedIdeaIds = syncedBriefs
    .map((brief) => brief.primaryIdeaId)
    .filter((ideaId) => survivingSegmentIds.has(ideaId))
  const syncedPublishedIdeaIdSet = new Set(syncedPublishedIdeaIds)
  const syncedIdeas = ideas.map((idea) => syncedPublishedIdeaIdSet.has(idea.id)
    ? { ...idea, status: 'published' as const }
    : idea.status === 'published'
      ? { ...idea, status: 'candidate' as const, selectionReason: `${idea.selectionReason} Dropped during sync-source because the published carousel markdown no longer exists.`.trim() }
      : idea)
  const carouselBundles = syncedBriefs.flatMap((brief) => {
    const idea = ideas.find((entry) => entry.id === brief.primaryIdeaId)
    const carouselEntry = carousels.find((entry) => entry.slug === brief.carouselSlug)
    if (!idea || !brief.carouselSlug || !carouselEntry) return []
    return [{
      brief,
      idea,
      critique: brief.critique ?? { status: 'accept', reasons: [], rewriteGoals: ['Recovered during sync-source from surviving carousel markdown.'] },
      carousel: {
        slug: brief.carouselSlug,
        title: carouselEntry.title,
        description: '',
        sourceType: 'transcript' as const,
        aspectRatio: 'portrait' as const,
        updatedAt: sourceManifest.fetchedAt ?? new Date().toISOString(),
        theme: {
          accent: '#7c3aed',
          background: '#0f172a',
          foreground: '#f8fafc',
          muted: '#cbd5e1',
        },
        slides: [],
      },
    }]
  })

  const nextManifest: SourceManifest = {
    ...sourceManifest,
    defaultBehavior: sourceManifest.defaultBehavior ?? 'creates source artifacts, ranks candidate ideas, promotes distinct briefs, and publishes markdown carousels from those briefs',
    ideaCount: syncedIdeas.length,
    briefCount: syncedBriefs.length,
    publishedIdeaIds: syncedPublishedIdeaIds,
    briefs: syncedBriefEntries,
    carousels,
    createdFiles: [
      `sources/${sourceSlug}/source.json`,
      `sources/${sourceSlug}/raw-transcript.md`,
      `sources/${sourceSlug}/clean-transcript.md`,
      `sources/${sourceSlug}/segments.json`,
      `sources/${sourceSlug}/ideas.json`,
      `sources/${sourceSlug}/briefs.json`,
      `sources/${sourceSlug}/summary.md`,
      ...carousels.map((entry) => `carousels/${entry.slug}/carousel.md`),
      'carousels/index.json',
    ],
  }

  await writeFile(path.join(sourceDir, 'source.json'), `${JSON.stringify(nextManifest, null, 2)}\n`, 'utf8')
  await writeFile(path.join(sourceDir, 'ideas.json'), `${JSON.stringify(syncedIdeas, null, 2)}\n`, 'utf8')
  await writeFile(path.join(sourceDir, 'summary.md'), buildSummary(metadata, sourceSlug, carouselBundles as CarouselBundle[], syncedIdeas, syncedBriefs), 'utf8')

  console.log(`Synced source manifest for ${sourceSlug} (${carousels.length} surviving carousel${carousels.length === 1 ? '' : 's'})`)
}

function parseSyncSourceArgs(argv: string[]) {
  const args: { sourceSlug?: string; repo?: boolean } = {}

  for (let i = 0; i < argv.length; i++) {
    const current = argv[i]
    if (!current) continue

    if (current === '--repo') {
      args.repo = true
      continue
    }

    if (!args.sourceSlug && !current.startsWith('--')) {
      args.sourceSlug = current
      continue
    }

    throw new Error(`Unknown argument: ${current}`)
  }

  if (args.repo && args.sourceSlug) {
    throw new Error('Usage: content-carousel sync-source <source-slug> | content-carousel sync-source --repo')
  }

  if (!args.repo && !args.sourceSlug) {
    throw new Error('Usage: content-carousel sync-source <source-slug> | content-carousel sync-source --repo')
  }

  return args
}

async function listSourceSlugs() {
  try {
    const names = await readdir(path.resolve('sources'), { withFileTypes: true })
    return names.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort((a, b) => a.localeCompare(b))
  } catch {
    return []
  }
}

async function readCarouselMarkdown(slug: string) {
  const filePath = path.resolve('carousels', slug, 'carousel.md')
  try {
    await access(filePath)
    const raw = await readFile(filePath, 'utf8')
    const parsed = matter(raw)
    const slides = parsed.content
      .split(/^---\s*$/m)
      .map((section) => section.trim())
      .filter(Boolean)
      .map((section, index) => {
        const heading = section
          .split(/\r?\n/)
          .map((line) => line.trim())
          .find((line) => /^#{1,6}\s+/.test(line))

        return {
          id: String(index + 1).padStart(2, '0'),
          title: heading ? heading.replace(/^#{1,6}\s+/, '').trim() : '',
        }
      })

    return {
      title: String(parsed.data.title ?? slug).trim(),
      slides,
    }
  } catch {
    return undefined
  }
}

async function collectRepoTitleReservations(sourceSlug: string, options: TitleReservationOptions = {}) {
  const reservations = new Set<string>()
  const sourceSlugs = await listSourceSlugs()

  for (const slug of sourceSlugs) {
    if (!slug || slug === '.DS_Store' || slug === sourceSlug) continue

    try {
      const manifest = await readSourceManifest(path.resolve('sources', slug))
      if (!manifest) continue
      for (const entry of manifest.carousels ?? []) {
        if (!entry.slug || options.excludeCarouselSlugs?.has(entry.slug)) continue
        const carousel = await readCarouselMarkdown(entry.slug)
        const title = cleanSentence(carousel?.title ?? entry.title ?? '')
        if (title) {
          reservations.add(title.toLowerCase())
        }

        for (const slide of carousel?.slides ?? []) {
          const slideTitle = cleanSentence(slide.title)
          if (slideTitle) {
            reservations.add(slideTitle.toLowerCase())
          }
        }
      }
    } catch {
      continue
    }
  }

  return reservations
}

function parseArgs(argv: string[]) {
  const args: { url?: string; slug?: string; whisperModel: string; maxSegments: number } = {
    whisperModel: process.env.YT_TRANSCRIPT_WHISPER_MODEL ?? 'base',
    maxSegments: 8,
  }

  for (let i = 0; i < argv.length; i++) {
    const current = argv[i]
    if (!current) continue

    if (!args.url && !current.startsWith('--')) {
      args.url = current
      continue
    }

    if (current === '--slug') {
      args.slug = argv[++i]
      continue
    }

    if (current.startsWith('--slug=')) {
      args.slug = current.split('=').slice(1).join('=')
      continue
    }

    if (current === '--whisper-model') {
      args.whisperModel = argv[++i] ?? args.whisperModel
      continue
    }

    if (current.startsWith('--whisper-model=')) {
      args.whisperModel = current.split('=').slice(1).join('=') || args.whisperModel
      continue
    }

    if (current === '--max-segments') {
      const value = Number(argv[++i])
      if (Number.isFinite(value) && value > 0) args.maxSegments = Math.floor(value)
      continue
    }

    if (current.startsWith('--max-segments=')) {
      const value = Number(current.split('=').slice(1).join('='))
      if (Number.isFinite(value) && value > 0) args.maxSegments = Math.floor(value)
      continue
    }

    throw new Error(`Unknown argument: ${current}`)
  }

  return args
}

function parseRebuildArgs(argv: string[]) {
  const args: { sourceSlug?: string; maxSegments?: number } = {}

  for (let i = 0; i < argv.length; i++) {
    const current = argv[i]
    if (!current) continue

    if (!args.sourceSlug && !current.startsWith('--')) {
      args.sourceSlug = current
      continue
    }

    if (current === '--max-segments') {
      const value = Number(argv[++i])
      if (Number.isFinite(value) && value > 0) args.maxSegments = Math.floor(value)
      continue
    }

    if (current.startsWith('--max-segments=')) {
      const value = Number(current.split('=').slice(1).join('='))
      if (Number.isFinite(value) && value > 0) args.maxSegments = Math.floor(value)
      continue
    }

    throw new Error(`Unknown argument: ${current}`)
  }

  return args
}

function printUsageAndExit(): never {
  console.error('Usage: content-carousel youtube <youtube-url> [--slug your-slug] [--whisper-model base] [--max-segments 8]')
  process.exit(1)
}

async function fetchVideoMetadata(url: string): Promise<VideoMetadata> {
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
  const response = await fetch(oembedUrl).catch(() => undefined)
  if (!response?.ok) {
    return { title: 'Untitled YouTube Source' }
  }

  const data = (await response.json()) as {
    title?: string
    author_name?: string
    author_url?: string
    thumbnail_url?: string
  }

  return {
    title: data.title ?? 'Untitled YouTube Source',
    authorName: data.author_name,
    authorUrl: data.author_url,
    thumbnailUrl: data.thumbnail_url,
  }
}

async function fetchTranscript(url: string, whisperModel: string) {
  try {
    await readFile(TRANSCRIPT_TOOL_PATH, 'utf8')
  } catch {
    throw new Error(`Missing transcript helper at ${TRANSCRIPT_TOOL_PATH}`)
  }

  const command = ['run', '--with', 'youtube-transcript-api', '--with', 'yt-dlp', 'python', TRANSCRIPT_TOOL_PATH, url]

  try {
    const result = await execFileAsync('uv', command, {
      env: {
        ...process.env,
        YT_TRANSCRIPT_WHISPER_MODEL: whisperModel,
      },
      maxBuffer: 20 * 1024 * 1024,
    })

    const transcriptMode = result.stderr.includes('falling back to local transcription')
      ? 'local-whisper-fallback'
      : 'official-transcript'

    return {
      transcript: result.stdout.trim(),
      transcriptMode,
    }
  } catch (error) {
    const details =
      typeof error === 'object' && error !== null && 'stderr' in error
        ? String((error as { stderr?: string }).stderr ?? '') || String((error as { stdout?: string }).stdout ?? '')
        : String(error)
    throw new Error(`Transcript fetch failed.\n${details}`)
  }
}

function parseTranscript(transcript: string): TranscriptLine[] {
  return transcript
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const match = line.match(RAW_TRANSCRIPT_RE)
      if (!match) return []
      const [, hh, mm, ss, text] = match
      return [
        {
          timestamp: `${hh}:${mm}:${ss}`,
          seconds: Number(hh) * 3600 + Number(mm) * 60 + Number(ss),
          text: normalizeText(text),
        },
      ]
    })
}

function normalizeText(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

function buildCleanTranscript(lines: TranscriptLine[]) {
  const sentences = lines.map((line) => line.text)
  const paragraphs: string[] = []
  let current: string[] = []

  for (const sentence of sentences) {
    current.push(sentence)
    const joined = current.join(' ')
    if (joined.length >= 450 || /[.!?]$/.test(sentence)) {
      paragraphs.push(joined)
      current = []
    }
  }

  if (current.length > 0) {
    paragraphs.push(current.join(' '))
  }

  return paragraphs
}

function segmentTranscript(lines: TranscriptLine[]): Segment[] {
  const chunks: Array<{ start: number; end: number }> = []
  let start = 0

  for (let i = 1; i < lines.length; i++) {
    const gap = lines[i].seconds - lines[i - 1].seconds
    const chunkLength = i - start
    const chars = lines.slice(start, i).reduce((sum, line) => sum + line.text.length, 0)
    const boundaryCue = /^(but|so|because|here'?s|the problem|the truth|if|when|instead|that means)\b/i.test(lines[i].text)

    if (gap >= 12 || chunkLength >= 8 || chars >= 700 || (chunkLength >= 4 && boundaryCue)) {
      chunks.push({ start, end: i - 1 })
      start = i
    }
  }

  chunks.push({ start, end: lines.length - 1 })

  return chunks.map((chunk, index) => {
    const selected = lines.slice(chunk.start, chunk.end + 1)
    const text = selected.map((line) => line.text).join(' ')
    const scoreBreakdown = scoreSegment(text)
    const score = Object.values(scoreBreakdown).reduce((sum, value) => sum + value, 0)

    return {
      id: `segment-${String(index + 1).padStart(2, '0')}`,
      rank: 0,
      score,
      start: selected[0]?.timestamp ?? '00:00:00',
      end: selected[selected.length - 1]?.timestamp ?? '00:00:00',
      durationSeconds: Math.max(0, (selected[selected.length - 1]?.seconds ?? 0) - (selected[0]?.seconds ?? 0)),
      lineStart: chunk.start + 1,
      lineEnd: chunk.end + 1,
      wordCount: text.split(/\s+/).filter(Boolean).length,
      text,
      titleSuggestion: suggestTitle(text),
      hook: suggestHook(text),
      whyItCouldWork: explainSegment(scoreBreakdown, text),
      scoreBreakdown,
    }
  })
}

function rankSegments(segments: Segment[]): Segment[] {
  return [...segments]
    .sort((a, b) => b.score - a.score || Math.abs(65 - a.wordCount) - Math.abs(65 - b.wordCount))
    .map((segment, index) => ({ ...segment, rank: index + 1 }))
}

function refreshSegmentSuggestions(segments: Segment[]) {
  return segments.map((segment) => ({
    ...segment,
    titleSuggestion: suggestTitle(segment.text),
    hook: suggestHook(segment.text),
    whyItCouldWork: explainSegment(segment.scoreBreakdown, segment.text),
  }))
}

function scoreSegment(text: string): SegmentScoreBreakdown {
  const lower = text.toLowerCase()
  const words = lower.split(/\s+/).filter(Boolean)
  const wordCount = words.length
  const sentences = splitSentences(text)
  const firstSentence = sentences[0] ?? text

  const hookWords = countMatches(lower, [
    'problem',
    'mistake',
    'truth',
    'secret',
    'moat',
    'leverage',
    'bottleneck',
    'advantage',
    'why',
    'lesson',
    'risk',
    'fail',
    'tradeoff',
    'constraint',
    'attention',
    'boundary',
  ]) * 2

  const contrast = countMatches(lower, ['but', 'instead', 'however', 'not', 'without', 'yet', 'rather than']) * 2
  const specificity =
    countRegex(text, /\b\d+\b/g) * 2 +
    countRegex(text, /\b[A-Z]{2,}\b/g) +
    countMatches(lower, ['client', 'team', 'system', 'process', 'agent', 'workflow', 'model', 'operators'])
  const structure = /[:;]/.test(text) ? 2 : 0
  const question = text.includes('?') ? 3 : 0
  const credibility = countMatches(lower, ['i built', 'i learned', 'we learned', 'in practice', 'real', 'actually', 'in production']) * 2
  const clarity = sentences.length >= 2 ? 3 : 0
  const openingStrength = /\b(problem|mistake|truth|why|this is why|the real|most|if your|the skill)\b/i.test(firstSentence) ? 4 : 0
  const density = sentences.filter((sentence) => sentence.split(/\s+/).filter(Boolean).length >= 6).length >= 2 ? 3 : 0
  const fillerPenalty = -countMatches(lower, ['um', 'uh', 'like', 'you know', 'sort of', 'kind of']) * 2
  const lyricPenalty = /♪/.test(text) ? -12 : 0

  const uniqueWords = new Set(words.map((word) => word.replace(/[^a-z0-9]/g, '')).filter(Boolean))
  const lexicalDiversity = wordCount > 0 ? uniqueWords.size / wordCount : 0
  const repetitionPenalty = lexicalDiversity < 0.45 ? -6 : 0

  const fragmentPenalty =
    /^(and|but|so|because|which|that|then)\b/i.test(firstSentence) ||
    /^[a-z]/.test(firstSentence) ||
    /\b(and|but|so|because|which|that)\s*$/.test(text) ||
    /\.\.\.$/.test(text)
      ? -7
      : 0

  const introOutroPenalty = countMatches(lower, [
    'welcome back',
    'thanks for watching',
    'subscribe',
    'smash that like',
    'in this video',
    'before we get started',
    'link in the description',
  ])
    ? -10
    : 0

  let lengthPenalty = 0
  if (wordCount < 28) lengthPenalty = -8
  else if (wordCount < 40) lengthPenalty = -3
  else if (wordCount > 150) lengthPenalty = -8
  else if (wordCount > 120) lengthPenalty = -4

  return {
    hookWords,
    contrast,
    specificity,
    structure,
    question,
    credibility,
    clarity,
    openingStrength,
    density,
    fillerPenalty,
    lyricPenalty,
    repetitionPenalty,
    fragmentPenalty,
    introOutroPenalty,
    lengthPenalty,
  }
}

function buildIdeas(segments: Segment[], sourceSlug: string, publishLimit: number, existingSlugs: ExistingSlugMap = {}) {
  const ideas: Idea[] = []
  const strongIdeas: Idea[] = []
  let publishedCount = 0

  for (const segment of segments) {
    const rejectionReasons = getEditorialRejectionReasons(segment)
    const duplicateOf = strongIdeas.find((existing) => areNearDuplicates(existing, segment))

    if (duplicateOf) {
      ideas.push({
        ...segment,
        status: 'rejected',
        selectionReason: `Overlaps too much with stronger idea ${duplicateOf.id}.`,
        rejectionReasons: [`Overlaps with ${duplicateOf.id}`],
        duplicateOf: duplicateOf.id,
      })
      continue
    }

    if (rejectionReasons.length > 0) {
      ideas.push({
        ...segment,
        status: 'rejected',
        selectionReason: rejectionReasons[0] ?? 'Rejected by editorial filter.',
        rejectionReasons,
      })
      continue
    }

    const isPublished = publishedCount < publishLimit
    const carouselSlug = isPublished ? existingSlugs[segment.id] || buildCarouselSlug(sourceSlug, segment) : undefined
    const selectionReason = isPublished
      ? `Selected for publication as one of the top ${publishLimit} non-overlapping ideas.`
      : 'Strong candidate kept in the source package but not promoted to a published carousel in this run.'

    const idea: Idea = {
      ...segment,
      status: isPublished ? 'published' : 'candidate',
      selectionReason,
      rejectionReasons: [],
      carouselSlug,
    }

    ideas.push(idea)
    strongIdeas.push(idea)
    if (isPublished) {
      publishedCount += 1
    }
  }

  if (ideas.some((idea) => idea.status === 'published')) {
    return ideas
  }

  return segments.slice(0, publishLimit).map((segment, index) => ({
    ...segment,
    status: 'published' as const,
    selectionReason: `Fallback publication because no idea cleared the editorial filter; kept ranked slot ${index + 1}.`,
    rejectionReasons: [],
    carouselSlug: existingSlugs[segment.id] || buildCarouselSlug(sourceSlug, segment),
  }))
}

function getEditorialRejectionReasons(segment: Segment) {
  const reasons: string[] = []
  const text = segment.text
  const lower = text.toLowerCase()
  const fullSentenceCount = splitSentences(text).filter((sentence) => sentence.split(/\s+/).filter(Boolean).length >= 5).length

  if (segment.score < 4) reasons.push('Score is too weak for publication.')
  if (segment.wordCount < 28 || segment.wordCount > 155) reasons.push('Transcript chunk length is outside the publishable range.')
  if (fullSentenceCount < 2) reasons.push('Needs at least two complete sentences.')
  if (/^(and|but|so|because|which|that|then)\b/i.test(text)) reasons.push('Starts mid-thought instead of opening cleanly.')
  if (/^[a-z]/.test(text)) reasons.push('Starts with lowercase text, which usually indicates a fragment.')
  if (/\b(thanks for watching|subscribe|welcome back|link in the description)\b/i.test(text)) reasons.push('Contains intro/outro filler.')
  if (isSpecDumpSegment(lower)) reasons.push('Reads like specs, setup instructions, or reference material instead of a post thesis.')
  if (lacksClearEditorialPayoff(lower)) reasons.push('Lacks a clear why-this-matters payoff for a social post.')

  return [...new Set(reasons)]
}

function isSpecDumpSegment(lower: string) {
  const repoTourSignals = countMatches(lower, [
    'github repo',
    'hugging face',
    'download and run',
    'download and use',
    'instructions on how to',
    'click on this repo',
    'if you click on',
    'if you scroll down',
    'if you scroll up',
    'here are some more specs',
    'for your reference',
    'context window',
    'parameters',
    'gb of vram',
    'cuda gpu',
    'install this locally',
    'run this locally',
    'set this up locally',
  ])

  const dryReferenceSignals = countMatches(lower, [
    'specs',
    'reference',
    'repo',
    'folder',
    'architecture',
    'instructions',
    'requirements',
    'recommended',
    'download',
    'install',
    'setup',
  ])

  const noTensionOrLesson = countMatches(lower, [
    'problem',
    'mistake',
    'why',
    'matters',
    'tradeoff',
    'advantage',
    'risk',
    'lesson',
    'means',
    'changes',
  ]) === 0

  return repoTourSignals >= 2 || (repoTourSignals >= 1 && dryReferenceSignals >= 3) || (dryReferenceSignals >= 4 && noTensionOrLesson)
}

function lacksClearEditorialPayoff(lower: string) {
  const payoffSignals = countMatches(lower, [
    'this means',
    'why this matters',
    'the problem',
    'the mistake',
    'the point',
    'the takeaway',
    'the lesson',
    'the real',
    'advantage',
    'tradeoff',
    'risk',
    'bottleneck',
    'changes',
    'matters',
  ])

  const dryInfoSignals = countMatches(lower, [
    'for your reference',
    'here are some more specs',
    'contains all the instructions',
    'download and run',
    'download and use',
    'github repo',
    'hugging face',
    'context window',
    'parameters',
    'recommended',
  ])

  return payoffSignals === 0 && dryInfoSignals >= 2
}

function areNearDuplicates(a: Segment, b: Segment) {
  const aTokens = new Set(tokenizeForSimilarity(a.text))
  const bTokens = new Set(tokenizeForSimilarity(b.text))
  const overlap = [...aTokens].filter((token) => bTokens.has(token)).length
  const denominator = Math.max(aTokens.size, bTokens.size, 1)
  return overlap / denominator >= 0.72
}

function tokenizeForSimilarity(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 4)
}

function overlapScore(left: string, right: string) {
  const leftTokens = new Set(tokenizeForOverlap(left))
  const rightTokens = new Set(tokenizeForOverlap(right))
  if (leftTokens.size === 0 || rightTokens.size === 0) return 0

  let intersection = 0
  for (const token of leftTokens) {
    if (rightTokens.has(token)) intersection += 1
  }

  const union = new Set([...leftTokens, ...rightTokens]).size
  return union === 0 ? 0 : intersection / union
}

function scoreSupportIdeaAffinity(primary: Idea, candidate: Idea) {
  const primaryLines = uniqueNormalized([
    primary.hook,
    primary.titleSuggestion,
    primary.text,
    ...getCompleteThoughts(primary.text),
  ])
  const candidateLines = uniqueNormalized([
    candidate.hook,
    candidate.titleSuggestion,
    candidate.text,
    ...getCompleteThoughts(candidate.text),
  ])

  const directOverlap = Math.max(
    overlapScore(primary.text, candidate.text),
    overlapScore(primary.hook, candidate.hook),
    overlapScore(primary.titleSuggestion, candidate.titleSuggestion),
  )

  const lineOverlap = primaryLines.reduce((best, primaryLine) => {
    const current = candidateLines.reduce((innerBest, candidateLine) => Math.max(innerBest, overlapScore(primaryLine, candidateLine)), 0)
    return Math.max(best, current)
  }, 0)

  const sharedTokens = [...new Set(tokenizeForOverlap(primaryLines.join(' ')))].filter((token) => tokenizeForOverlap(candidateLines.join(' ')).includes(token))
  const topicalBonus = sharedTokens.filter((token) => token.length >= 6).length >= 2 ? 0.08 : 0

  return Math.max(directOverlap, lineOverlap) + topicalBonus
}

function isSupportIdeaAligned(primary: Idea, candidate: Idea) {
  const affinity = scoreSupportIdeaAffinity(primary, candidate)
  return affinity >= 0.18 || (affinity >= 0.12 && primary.scoreBreakdown.specificity + candidate.scoreBreakdown.specificity >= 3)
}

function tokenizeForOverlap(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 4 && !OVERLAP_STOP_WORDS.has(token))
}

const OVERLAP_STOP_WORDS = new Set([
  'about', 'after', 'before', 'being', 'from', 'have', 'into', 'just', 'more', 'much', 'that', 'their', 'them', 'then', 'they', 'this', 'what', 'when', 'where', 'which', 'with', 'your', 'yours', 'because', 'really', 'there', 'those', 'these', 'around', 'across', 'while', 'will', 'would', 'could', 'should', 'right', 'going',
])

function countMatches(text: string, phrases: string[]) {
  return phrases.reduce((sum, phrase) => sum + (text.includes(phrase) ? 1 : 0), 0)
}

function countRegex(text: string, regex: RegExp) {
  return [...text.matchAll(regex)].length
}

function suggestTitle(text: string) {
  const sentences = getUsableSentences(text)
  const best = pickDisplayLine(sentences, { preferredMax: 84 })
  return best || cleanSentence(text)
}

function suggestHook(text: string) {
  const sentences = getUsableSentences(text)
  const direct = sentences.find((sentence) => /\b(problem|mistake|truth|why|if|without|not|the skill|this is why)\b/i.test(sentence))
  return pickDisplayLine([direct ?? '', ...sentences], { preferredMax: 120 }) || cleanSentence(text)
}

function explainSegment(score: SegmentScoreBreakdown, text: string) {
  const reasons: string[] = []
  if (score.openingStrength > 0) reasons.push('opens with a statement that already sounds post-worthy')
  if (score.hookWords > 0) reasons.push('contains strong hook language instead of bland exposition')
  if (score.contrast > 0) reasons.push('has contrast/tension, which usually makes better post framing')
  if (score.specificity > 0) reasons.push('includes enough specificity to avoid sounding generic')
  if (score.credibility > 0) reasons.push('sounds grounded in lived or practical experience')
  if (score.density > 0) reasons.push('contains enough complete thoughts to turn into multiple slides')
  if (reasons.length === 0) reasons.push('is structurally clean enough to be edited into a tighter post')
  if (text.split(/\s+/).length > 120) reasons.push('but it should be trimmed before it becomes a post')
  return reasons
}

function splitSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
}

function getUsableSentences(text: string) {
  return splitSentences(text)
    .map((sentence) => cleanSentence(sentence))
    .filter((sentence) => sentence.length >= 18)
    .filter((sentence) => !/^[a-z]/.test(sentence))
    .filter((sentence) => !/^(and|but|so|because|which|that|then)\b/i.test(sentence))
}

function getCompleteThoughts(text: string) {
  return getUsableSentences(text)
    .filter((sentence) => /[.!?]$/.test(sentence))
    .map((sentence) => normalizeForSlide(sentence))
}

function cleanSentence(text: string) {
  return text
    .replace(/^\s*(?:>{1,3}|>>?)\s*/, '')
    .replace(/^[-–—:;,\s]+/, '')
    .replace(/\s+/g, ' ')
    .replace(/^(?:and|but|so|because|well)\b\s+/i, '')
    .replace(/^(?:really|honestly|frankly),?\s+/i, '')
    .replace(/^["'“”]+|["'“”]+$/g, '')
    .replace(/[,:;\-–—]+$/g, '')
    .trim()
}

function stripWeakLeadIn(text: string) {
  const cleaned = cleanSentence(text)
  if (!cleaned) return ''

  const stripped = cleaned
    .replace(/^not because [^,]{4,80}, but because\s+/i, '')
    .replace(/^i know that\s+/i, '')
    .replace(/^this is where\s+/i, '')
    .replace(/^if you are in any\s+/i, '')
    .replace(/^if you(?:'|’)re in any\s+/i, '')
    .replace(/^there are many\s+/i, '')
    .replace(/^it(?:'|’)s one of the most important [^.?!,]{6,80}(?:that i think i(?:'|’)m going to make this year)?[,:]?\s*/i, '')
    .trim()

  return cleanSentence(stripped)
}

function isWeakLeadInLine(text: string) {
  const cleaned = cleanSentence(text)
  if (!cleaned) return true

  return /^(?:i know that|this is where|if you(?:'|’)re? in any|there are many|it(?:'|’)s one of the most important structural arguments|not because [^,]{4,80}, but because)\b/i.test(cleaned)
}

function isWeakDisplayLine(text: string) {
  const cleaned = cleanSentence(text)
  if (!cleaned) return true
  if (cleaned.length < 24) return true
  if (/,$/.test(cleaned)) return true
  if (/^(for|to|and|but|or)\b/i.test(cleaned)) return true
  if (/\b(this|that|it) is (much )?more important\b/i.test(cleaned)) return true
  if (isWeakLeadInLine(cleaned)) return true
  if (isMetaNarrationLine(cleaned)) return true
  if (isWeakBriefLineCandidate(cleaned)) return true
  return false
}

function isWeakBriefLineCandidate(text: string) {
  const cleaned = cleanSentence(text)
  if (!cleaned) return true
  if (cleaned.length < 28) return true
  if (/,$/.test(cleaned)) return true
  if (/\?$/.test(cleaned)) return true
  if (/^(i('| a)?m going to|get into|we are going to|i('| a)?ve seen|the first is|do you love|thank you very much|here('| i)?s what|right now|for \d+ years|a lot of people|if you are waiting and seeing|now|now,|starting fresh)\b/i.test(cleaned)) return true
  if (isWeakLeadInLine(cleaned)) return true
  if (isMetaNarrationLine(cleaned)) return true
  if (/^(this|that|it)\b/i.test(cleaned) && cleaned.length < 48) return true
  if (/^(there('| i)?s|here('| i)?s)\b/i.test(cleaned) && cleaned.length < 54) return true
  if (/\b(right|okay|ok|cheers)\b[.!?]*$/i.test(cleaned)) return true
  return false
}

function isMetaNarrationLine(text: string) {
  const cleaned = cleanSentence(text)
  if (!cleaned) return true
  if (/^(this is (a )?(video|podcast|episode) about|in this (video|podcast|episode)|the point of this (video|podcast|episode)|this is not about learning to code|that is the skill of \d{4})\b/i.test(cleaned)) {
    return true
  }

  return isCallToActionOrBanterLine(cleaned)
}

function isCallToActionOrBanterLine(text: string) {
  const cleaned = cleanSentence(text)
  if (!cleaned) return true

  return /^(here you can see|here are some|i(?:'| a)?ll link|if you(?:'|’)re interested in|check out|go (?:watch|read|try)|subscribe|smash that like|thanks for watching|thank you(?: very much)?|listen up everyone|all right|alright|baby hotties|in humanoid robot news|this week in|unitree g1 robot in real life)\b/i.test(cleaned)
}

function trimSentence(text: string, max: number) {
  return pickDisplayLine([text], { preferredMax: max }) || cleanSentence(text)
}

function pickDisplayLine(candidates: string[], options: { preferredMax: number }) {
  const normalized = candidates
    .map((candidate) => cleanSentence(candidate))
    .filter(Boolean)

  const directFits = normalized.filter((candidate) => candidate.length <= options.preferredMax)
  const strongDirectFit = rankDisplayCandidates(directFits).find((candidate) => !isWeakDisplayLine(candidate))
  if (strongDirectFit) return strongDirectFit

  const clauseFits = normalized
    .flatMap((candidate) => splitIntoClauses(candidate))
    .map((candidate) => cleanSentence(candidate))
    .filter((candidate) => candidate.length >= 18 && candidate.length <= options.preferredMax)
    .filter((candidate) => !/^[a-z]/.test(candidate))
    .filter((candidate) => !/^(and|but|so|because|which|that|then)\b/i.test(candidate))

  const strongClauseFit = rankDisplayCandidates(clauseFits).find((candidate) => !isWeakDisplayLine(candidate))
  if (strongClauseFit) return strongClauseFit

  if (directFits.length > 0) {
    return rankDisplayCandidates(directFits)[0]
  }

  if (clauseFits.length > 0) {
    return rankDisplayCandidates(clauseFits)[0]
  }

  return rankDisplayCandidates(normalized)[0]
}

function rankDisplayCandidates(candidates: string[]) {
  return [...new Set(candidates)]
    .sort((a, b) => scoreDisplayCandidate(b) - scoreDisplayCandidate(a))
}

function scoreDisplayCandidate(candidate: string) {
  const cleaned = cleanSentence(candidate)
  if (!cleaned) return Number.NEGATIVE_INFINITY

  let score = 0
  const length = cleaned.length
  if (length >= 34 && length <= 82) score += 8
  else if (length >= 28 && length <= 90) score += 5
  else if (length < 24) score -= 12
  else score -= Math.max(0, length - 90) * 0.08

  if (!isWeakDisplayLine(cleaned)) score += 18
  if (/[.!?]$/.test(cleaned)) score += 1
  if (/\b(you|your|teams?|operators?|founders?|workflow|system|model|trust|review|handoff|bottleneck|context|agents?)\b/i.test(cleaned)) score += 3
  if (/^(if|when|once|instead|but)\b/i.test(cleaned)) score += 2
  if (/^(more|better|planning|compute|save early|ask instead|better question)\b/i.test(cleaned)) score -= 6
  if (/^(for|to|and|but|or)\b/i.test(cleaned)) score -= 8
  if (/^(most people ask|don'?t ask|better question|ask instead)[:]?$/i.test(cleaned)) score -= 10
  if (/^(in|for)\b/i.test(cleaned) && length < 40) score -= 5

  return score
}

function splitIntoClauses(text: string) {
  return text
    .split(/(?<=[.!?])\s+|(?<=[,;:])\s+|\s+[—–-]\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function buildBriefs(publishedIdeas: Idea[], allIdeas: Idea[], sourceSlug: string, existingSlugs: ExistingSlugMap = {}) {
  const briefs: Brief[] = []
  const usedTheses = new Set<string>()
  const usedWhy = new Set<string>()
  const usedSupport = new Set<string>()
  const usedSupportLines: string[] = []
  const usedSupportingIdeaIds = new Set<string>()

  for (const idea of publishedIdeas) {
    const supportingIdeas = allIdeas
      .filter((candidate) => candidate.id !== idea.id)
      .filter((candidate) => candidate.status === 'candidate')
      .filter((candidate) => !areNearDuplicates(candidate, idea))
      .filter((candidate) => getCompleteThoughts(candidate.text).some((line) => !isWeakBriefLineCandidate(line)))
      .map((candidate) => ({ candidate, affinity: scoreSupportIdeaAffinity(idea, candidate) }))
      .filter(({ candidate, affinity }) => isSupportIdeaAligned(idea, candidate) || affinity >= 0.1)
      .sort((a, b) => {
        const aFresh = usedSupportingIdeaIds.has(a.candidate.id) ? 1 : 0
        const bFresh = usedSupportingIdeaIds.has(b.candidate.id) ? 1 : 0
        return aFresh - bFresh || b.affinity - a.affinity || b.candidate.score - a.candidate.score
      })
      .slice(0, 3)
      .map(({ candidate }) => candidate)

    const thesis = pickDistinctThesis([
      idea.hook,
      idea.titleSuggestion,
      ...getCompleteThoughts(idea.text),
      extractTakeaway(idea.text, supportingIdeas),
    ], usedTheses)

    const whyItMatters = inferWhyItMatters(idea, supportingIdeas, thesis, usedWhy)
    const supportPoints = buildSupportPoints(idea, supportingIdeas, usedSupport, usedSupportLines, thesis, whyItMatters)

    const scorecard = scoreBriefAngle(idea, supportingIdeas, thesis, whyItMatters, supportPoints)
    const brief: Brief = {
      id: `brief-${idea.id}`,
      primaryIdeaId: idea.id,
      supportingIdeaIds: supportingIdeas.map((entry) => entry.id),
      thesis,
      audience: inferAudience(idea.text, supportingIdeas),
      whyItMatters,
      supportPoints,
      distinctFromBriefIds: publishedIdeas.filter((entry) => entry.id !== idea.id).map((entry) => `brief-${entry.id}`),
      scorecard,
      critique: buildBriefCritique(scorecard, thesis, whyItMatters, supportPoints),
      carouselSlug: existingSlugs[idea.id] || buildCarouselSlug(sourceSlug, idea),
    }

    for (const supportIdea of supportingIdeas) {
      usedSupportingIdeaIds.add(supportIdea.id)
    }

    const overlapsExisting = briefs.some((existing) => briefClaimOverlap(existing, brief) >= 0.48)
    if (overlapsExisting) {
      continue
    }

    briefs.push(brief)
  }

  if (briefs.length > 0) {
    return briefs
  }

  const fallbackIdea = publishedIdeas[0]
  if (!fallbackIdea) return []

  const fallbackThesis = pickDistinctThesis([
    fallbackIdea.hook,
    fallbackIdea.titleSuggestion,
    ...getCompleteThoughts(fallbackIdea.text),
    'The old operating model is already expiring.',
  ], new Set())
  const fallbackWhy = inferWhyItMatters(fallbackIdea, [], fallbackThesis, new Set())
  const fallbackSupportPoints = buildSupportPoints(fallbackIdea, [], new Set(), [], fallbackThesis, fallbackWhy)
  const fallbackScorecard = scoreBriefAngle(fallbackIdea, [], fallbackThesis, fallbackWhy, fallbackSupportPoints)

  return [{
    id: `brief-${fallbackIdea.id}`,
    primaryIdeaId: fallbackIdea.id,
    supportingIdeaIds: [],
    thesis: fallbackThesis,
    audience: inferAudience(fallbackIdea.text, []),
    whyItMatters: fallbackWhy,
    supportPoints: fallbackSupportPoints,
    distinctFromBriefIds: [],
    scorecard: fallbackScorecard,
    critique: buildBriefCritique(fallbackScorecard, fallbackThesis, fallbackWhy, fallbackSupportPoints),
    carouselSlug: existingSlugs[fallbackIdea.id] || buildCarouselSlug(sourceSlug, fallbackIdea),
  }]
}

function scoreBriefAngle(primary: Idea, support: Idea[], thesis: string, whyItMatters: string, supportPoints: string[]): BriefScorecard {
  const sourceText = [primary.text, primary.hook, primary.titleSuggestion, thesis, whyItMatters, ...supportPoints, ...support.map((idea) => idea.text)].join(' ')
  const lowered = sourceText.toLowerCase()
  const themeStrength = Math.max(1, Math.min(5,
    (thesis.length >= 48 ? 2 : 1)
    + (supportPoints.length >= 2 ? 1 : 0)
    + (/(system|workflow|boundary|market|strategy|moat|operating|trust|distribution|review|agent)/i.test(sourceText) ? 1 : 0)
    + (supportPoints.some((point) => point.length >= 52) ? 1 : 0),
  ))
  const authorityPotential = Math.max(1, Math.min(5,
    2
    + (/(most teams|smart teams|operators?|leaders?|founders?|organizations?|companies)/i.test(sourceText) ? 1 : 0)
    + (/(overcomplicating|wrong question|real question|real story|actually|not just)/i.test(sourceText) ? 1 : 0)
    + (supportPoints.length >= 2 ? 1 : 0),
  ))
  const clarity = Math.max(1, Math.min(5,
    2
    + (thesis.length <= 90 ? 1 : 0)
    + (whyItMatters.length <= 110 ? 1 : 0)
    + (supportPoints.every((point) => point.length <= 120) ? 1 : 0),
  ))
  const distinctness = Math.max(1, Math.min(5,
    2
    + (support.length === 0 ? 1 : 0)
    + (new Set(supportPoints.map((point) => slugify(point))).size === supportPoints.length ? 1 : 0)
    + (!/(everyone|everything|nothing|always|never)/i.test(thesis) ? 1 : 0),
  ))
  const commercialRelevance = Math.max(1, Math.min(5,
    1
    + (/(company|teams|operators?|leaders?|organizations?|buyers?|market|workflow|process)/i.test(sourceText) ? 2 : 0)
    + (/(cost|speed|trust|review|margin|delivery|adoption|sales)/i.test(lowered) ? 1 : 0)
    + (/(engineer|product|manager|founder)/i.test(lowered) ? 1 : 0),
  ))
  const fidelity = Math.max(1, Math.min(5,
    2
    + (primary.wordCount >= 38 ? 1 : 0)
    + (supportPoints.length >= 2 ? 1 : 0)
    + (!/(must|guarantee|everyone|nobody|always|never)/i.test(thesis) ? 1 : 0),
  ))

  return {
    themeStrength,
    authorityPotential,
    clarity,
    distinctness,
    commercialRelevance,
    fidelity,
    total: themeStrength + authorityPotential + clarity + distinctness + commercialRelevance + fidelity,
  }
}

function buildBriefCritique(scorecard: BriefScorecard, thesis: string, whyItMatters: string, supportPoints: string[]): EditorialCritique {
  const reasons: string[] = []
  const rewriteGoals: string[] = []

  if (scorecard.themeStrength <= 3) {
    reasons.push('Angle feels thinner than the best concept-led carousels.')
    rewriteGoals.push('Center the strongest underlying theme, not just the most quotable line.')
  }
  if (scorecard.authorityPotential <= 3) {
    reasons.push('Voice risks sounding descriptive instead of sharp and opinionated.')
    rewriteGoals.push('Make the framing feel more like a real point of view with operator conviction.')
  }
  if (scorecard.clarity <= 3 || thesis.length > 96) {
    reasons.push('Hook or slide spine is carrying too much verbal clutter.')
    rewriteGoals.push('Compress the lead and make the slide progression cleaner.')
  }
  if (scorecard.fidelity <= 3) {
    reasons.push('Claim strength is getting too close to overreach.')
    rewriteGoals.push('Keep the claim sharp, but anchor it more tightly to what the source actually supports.')
  }
  if (supportPoints.length < 2) {
    reasons.push('Not enough support to justify a padded multi-slide carousel.')
    rewriteGoals.push('Ship fewer slides or tighten every supporting point.')
  }
  if (!rewriteGoals.length) {
    rewriteGoals.push('Preserve the real theme, keep the voice sharp, and avoid filler.')
  }

  return {
    status: reasons.length > 0 ? 'rewrite' : 'accept',
    reasons,
    rewriteGoals,
  }
}

function buildCarouselBundles(
  metadata: VideoMetadata,
  sourceSlug: string,
  briefs: Brief[],
  ideas: Idea[],
  reservedRepoTitles: Set<string> = new Set(),
): CarouselBundle[] {
  const usedBatchTitles = new Set<string>(reservedRepoTitles)

  return briefs.flatMap((brief) => {
    const idea = ideas.find((entry) => entry.id === brief.primaryIdeaId)
    if (!idea) return []
    const carouselSlug = brief.carouselSlug || idea.carouselSlug || buildCarouselSlug(sourceSlug, idea)
    const draftCarousel = buildCarousel(metadata, sourceSlug, carouselSlug, brief, idea, ideas, usedBatchTitles)
    const critique = critiqueCarouselDraft(draftCarousel, brief, idea)
    const carousel = critique.status === 'rewrite'
      ? rewriteCarouselFromCritique(draftCarousel, brief, idea, critique, usedBatchTitles)
      : draftCarousel
    return [{
      brief: { ...brief, carouselSlug },
      idea: { ...idea, carouselSlug },
      carousel,
      critique,
    }]
  })
}

function buildSummary(metadata: VideoMetadata, sourceSlug: string, carouselBundles: CarouselBundle[], ideas: Idea[], briefs: Brief[]) {
  const published = ideas.filter((idea) => idea.status === 'published')
  const candidates = ideas.filter((idea) => idea.status === 'candidate').slice(0, 5)
  const rejected = ideas.filter((idea) => idea.status === 'rejected').slice(0, 5)
  return `# Source Summary\n\n## Video\n- Title: ${metadata.title}\n- Creator: ${metadata.authorName ?? 'Unknown'}\n\n## Carousels created automatically\n- Source slug: ${sourceSlug}\n- Carousel count: ${carouselBundles.length}\n${carouselBundles
    .map(
      (bundle) => `- ${bundle.carousel.slug} → /carousel/${bundle.carousel.slug} (brief ${bundle.brief.id} from ${bundle.idea.id}, ${bundle.idea.start} → ${bundle.idea.end}, score ${bundle.idea.score}, editorial ${bundle.critique.status})`,
    )
    .join('\n')}\n\n## Published briefs\n${briefs
    .map(
      (brief, index) => `\n### #${index + 1} — ${brief.thesis}\n- Brief: ${brief.id}\n- Primary idea: ${brief.primaryIdeaId}\n- Audience: ${brief.audience}\n- Why it matters: ${brief.whyItMatters}\n- Angle score: ${brief.scorecard.total}/30 (theme ${brief.scorecard.themeStrength}, authority ${brief.scorecard.authorityPotential}, clarity ${brief.scorecard.clarity}, distinctness ${brief.scorecard.distinctness}, commercial ${brief.scorecard.commercialRelevance}, fidelity ${brief.scorecard.fidelity})\n- Brief critique: ${brief.critique.status}\n- Rewrite goals:\n${brief.critique.rewriteGoals.map((goal) => `  - ${goal}`).join('\n')}\n- Support:\n${brief.supportPoints.map((point) => `  - ${point}`).join('\n')}\n- Distinct from: ${brief.distinctFromBriefIds.join(', ') || 'n/a'}\n`,
    )
    .join('\n')}\n\n## Published ideas\n${published
    .map(
      (idea) => `\n### #${idea.rank} — ${idea.titleSuggestion}\n- Status: ${idea.status}\n- Score: ${idea.score}\n- Time: ${idea.start} → ${idea.end}\n- Hook: ${idea.hook}\n- Why it could work:\n${idea.whyItCouldWork.map((reason) => `  - ${reason}`).join('\n')}\n`,
    )
    .join('\n')}\n\n## Candidate ideas not published this run\n${candidates.length > 0
    ? candidates
      .map(
        (idea) => `\n### #${idea.rank} — ${idea.titleSuggestion}\n- Status: ${idea.status}\n- Reason: ${idea.selectionReason}\n- Time: ${idea.start} → ${idea.end}\n`,
      )
      .join('\n')
    : '\nNo additional candidate ideas survived beyond the published set.\n'}\n## Rejected ideas\n${rejected.length > 0
    ? rejected
      .map(
        (idea) => `\n### #${idea.rank} — ${idea.titleSuggestion}\n- Status: ${idea.status}\n- Reason: ${idea.selectionReason}\n- Rejection notes: ${idea.rejectionReasons.join('; ')}\n`,
      )
      .join('\n')
    : '\nNo top-ranked ideas were rejected.\n'}\n## Editorial note\nPublished ideas are now promoted into explicit briefs before carousels are generated. The source package keeps ideas plus briefs so a later pass can improve distinctness without re-ingesting the transcript.\n`
}

function buildCarousel(
  metadata: VideoMetadata,
  sourceSlug: string,
  carouselSlug: string,
  brief: Brief,
  primary: Idea,
  ideas: Idea[],
  usedBatchTitles: Set<string> = new Set(),
): Carousel {
  const companionSegments = ideas.filter((idea) => brief.supportingIdeaIds.includes(idea.id))
  const primaryThoughts = getCompleteThoughts(primary.text)
  const companionThoughts = companionSegments.flatMap((segment) => getCompleteThoughts(segment.text))
  const support = uniqueNormalized([...primaryThoughts.slice(1), ...companionThoughts]).filter((sentence) => sentence.length >= 24)

  const opening = chooseOpeningTitle([
    brief.thesis,
    primaryThoughts[0] ?? '',
    primary.hook,
    primary.titleSuggestion,
    extractTakeaway(primary.text, companionSegments),
    'AI operating models are getting stale faster than most teams realize.',
  ])

  const frameworkItems = uniqueNormalized([
    ...brief.supportPoints,
    support[5] ?? 'Update your mental model before you update the workflow.',
    support[8] ?? 'Decide what deserves human review and what can safely flow through.',
    extractTakeaway(primary.text, companionSegments),
  ]).slice(0, 4)

  const usedTitles = new Set<string>()
  const takeTitle = (...candidates: string[]) => pickUniqueTitle(usedTitles, candidates, usedBatchTitles)

  const slide1Title = takeTitle(
    opening,
    brief.thesis,
    primary.hook,
    primary.titleSuggestion,
    'AI operating models are getting stale faster than most teams realize.',
  )

  const slide2Title = takeTitle(
    brief.whyItMatters,
    primaryThoughts[1] ?? '',
    primaryThoughts[2] ?? '',
    support[0] ?? '',
    titleFromIdea(primary, 'This matters because stale mental models break fast.'),
  )

  const slide3Title = takeTitle(
    brief.supportPoints[0] ?? '',
    primaryThoughts[2] ?? '',
    primaryThoughts[3] ?? '',
    titleFromSentence(support[4] ?? ''),
    titleFromIdea(primary, 'The real skill is recalibrating as the boundary keeps moving.'),
  )

  const slide4Title = takeTitle(
    brief.supportPoints[1] ?? '',
    primaryThoughts[3] ?? '',
    primaryThoughts[4] ?? '',
    titleFromSentence(companionSegments[0]?.hook ?? ''),
    titleFromIdea(primary, 'Human attention becomes the real bottleneck.'),
  )

  const closingFallbackTitle = buildClosingFallback(brief)

  const slide5Title = takeTitle(
    brief.supportPoints[2] ?? '',
    primaryThoughts[4] ?? '',
    extractTakeaway(primary.text, companionSegments),
    titleFromIdea(primary, closingFallbackTitle),
    closingFallbackTitle,
  )

  const slide4BodyLead = uniqueNormalized([
    titleFromSentence(support[7] ?? ''),
    support[6] ?? '',
    'The workflow needs clearer review boundaries.',
  ])[0] ?? 'The workflow needs clearer review boundaries.'

  const draftSlides: Array<{ title: string, body: string }> = [
    {
      title: slide1Title,
      body: '',
    },
    {
      title: slide2Title,
      body: buildBodyLines([
        brief.whyItMatters,
        support[2] ?? 'Most people are still acting on an old picture of what AI can and cannot do.',
        support[3] ?? 'That creates wasted effort, bad delegation, and skepticism aimed at the wrong failure modes.',
      ]),
    },
    {
      title: slide3Title,
      body: buildQuoteBody([
        brief.supportPoints[0] ?? '',
        support[5] ?? 'What worked as a rule of thumb a few months ago can already be wrong now.',
        support[6] ?? 'Operators need current failure models, not generic vibes.',
      ]),
    },
    {
      title: slide4Title,
      body: buildBodyLines([
        slide4BodyLead,
        frameworkItems[0] ?? brief.supportPoints[1] ?? 'Operators need a cleaner decision path.',
      ]),
    },
    {
      title: slide5Title,
      body: buildBodyLines([
        brief.audience,
        'Use the source package as evidence, not as final copy.',
        'Then sharpen the thesis until it actually sounds like Maurilio, not a transcript.',
      ]),
    },
  ]

  const extraSlides = uniqueNormalized([
    frameworkItems[1] ?? '',
    frameworkItems[2] ?? '',
    frameworkItems[3] ?? '',
    support[0] ?? '',
    support[1] ?? '',
    support[4] ?? '',
    support[5] ?? '',
    support[6] ?? '',
    support[7] ?? '',
    support[8] ?? '',
    brief.supportPoints[2] ?? '',
    extractTakeaway(primary.text, companionSegments),
  ])
    .filter((line) => line.length >= 24)
    .filter((line) => !draftSlides.some((slide) => slide.title.toLowerCase() === line.toLowerCase() || slide.body.toLowerCase().includes(line.toLowerCase())))
    .slice(0, MAX_CAROUSEL_SLIDES - MIN_CAROUSEL_SLIDES)
    .map((line, index) => ({
      title: takeTitle(line, titleFromSentence(line), 'This is where the workflow really changes.'),
      body: buildBodyLines([
        line,
        index % 2 === 0 ? brief.whyItMatters : extractTakeaway(primary.text, companionSegments),
      ]),
    }))

  const targetSlideCount = Math.max(MIN_CAROUSEL_SLIDES, Math.min(MAX_CAROUSEL_SLIDES, MIN_CAROUSEL_SLIDES + extraSlides.length))
  const middleSlides = [...draftSlides.slice(1, -1)]
  if (targetSlideCount > MIN_CAROUSEL_SLIDES) {
    middleSlides.splice(Math.max(1, middleSlides.length - 1), 0, ...extraSlides.slice(0, targetSlideCount - MIN_CAROUSEL_SLIDES))
  }

  const assembledSlides = [draftSlides[0], ...middleSlides, draftSlides[draftSlides.length - 1]].slice(0, targetSlideCount)
  const slides: CarouselSlide[] = assembledSlides.map((slide, index) => ({
    id: String(index + 1).padStart(2, '0'),
    title: slide.title,
    body: slide.body,
  }))

  return editorialPolishCarousel(brief, {
    slug: carouselSlug,
    title: titleBaseFromSlides(slides),
    description: `${metadata.authorName ?? 'YouTube'} on ${sourceSlug}: ${primary.start} → ${primary.end}.`,
    sourceType: 'transcript',
    aspectRatio: 'portrait',
    updatedAt: new Date().toISOString().slice(0, 10),
    theme: DEFAULT_THEME,
    slides,
  }, usedBatchTitles)
}

function editorialPolishCarousel(brief: Brief, carousel: Carousel, usedBatchTitles: Set<string> = new Set()) {
  const usedTitles = new Set<string>()
  const totalSlides = carousel.slides.length
  const polishedSlides = carousel.slides.map((slide, index) => {
    const cleanedBody = polishSlideBody(slide.body, index, totalSlides)
    const titleCandidates = [
      slide.title,
      index === 0 ? brief.thesis : '',
      index === 1 ? brief.whyItMatters : '',
      brief.supportPoints[index - 2] ?? '',
      fallbackTitleForPosition(index, brief, totalSlides),
    ].filter(Boolean)

    const title = pickUniqueTitle(usedTitles, titleCandidates, usedBatchTitles)
    return {
      ...slide,
      title,
      body: cleanedBody,
    }
  })

  const finalSlides = ensureCarouselProgression(brief, polishedSlides, usedBatchTitles)

  return {
    ...carousel,
    title: titleBaseFromSlides(finalSlides),
    slides: finalSlides,
  }
}

function titleBaseFromSlides(slides: CarouselSlide[]) {
  const cleaned = slides
    .map((slide) => cleanSentence(slide.title))
    .filter(Boolean)

  const preferred = cleaned.find((title, index) => index > 0 && !isGenericReserveTitle(title) && !isSyntheticReserveTitle(title))
  if (preferred) return preferred

  const fallback = cleaned.find((title) => !isGenericReserveTitle(title))
  return fallback || cleaned[0] || 'Untitled carousel'
}

function isGenericReserveTitle(title: string) {
  return /^(agent workflow pressure|model progress|team redesign|buyer behavior|product demo velocity|capability shift)\b/i.test(cleanSentence(title))
}

function isSyntheticReserveTitle(title: string) {
  const cleaned = cleanSentence(title)
  if (!cleaned) return true
  if (/^untitled (slide|carousel)\b/i.test(cleaned)) return true
  if (/\(\d+\)$/.test(cleaned)) return true
  if (/\b(for operators|in production|when context drifts|once the workflow shifts|before the next handoff|under real load)\b/i.test(cleaned)) return true
  return false
}

function critiqueCarouselDraft(carousel: Carousel, brief: Brief, idea: Idea): EditorialCritique {
  const reasons: string[] = [...brief.critique.reasons]
  const rewriteGoals: string[] = [...brief.critique.rewriteGoals]
  const firstSlide = carousel.slides[0]
  const lastSlide = carousel.slides[carousel.slides.length - 1]
  const weakBodies = carousel.slides.filter((slide, index) => index > 0 && slide.body.trim().length < 45)
  const repeatedTitles = new Set<string>()
  const seenTitles = new Set<string>()

  for (const slide of carousel.slides) {
    const key = cleanSentence(slide.title).toLowerCase()
    if (!key) continue
    if (seenTitles.has(key)) repeatedTitles.add(key)
    seenTitles.add(key)
  }

  if (!firstSlide || firstSlide.title.trim().length < 24) {
    reasons.push('Opening claim is too thin to carry the carousel.')
    rewriteGoals.push('Strengthen slide one so it states the real theme immediately.')
  }
  if (firstSlide && isWeakDisplayLine(firstSlide.title)) {
    reasons.push('Opening hook still feels generic.')
    rewriteGoals.push('Replace the lead with a sharper, more opinionated framing.')
  }
  if (weakBodies.length >= 2) {
    reasons.push('Too many slides are running on fumes instead of real support.')
    rewriteGoals.push('Trim or rewrite weak middle slides so each one earns its place.')
  }
  if (repeatedTitles.size > 0) {
    reasons.push('Slide titles are stepping on each other.')
    rewriteGoals.push('Make each slide advance the idea instead of repeating the same claim.')
  }
  if (lastSlide && lastSlide.title.trim().length < 18) {
    reasons.push('Closing payoff is not landing cleanly enough.')
    rewriteGoals.push('End with a sharper takeaway or operator-level implication.')
  }
  if (idea.wordCount < 42 && carousel.slides.length > MIN_CAROUSEL_SLIDES) {
    reasons.push('The source segment is not rich enough to justify this many slides.')
    rewriteGoals.push('Compress the carousel to the strongest surviving spine.')
  }

  const uniqueGoals = uniqueNormalized(rewriteGoals)
  return {
    status: reasons.length > 0 ? 'rewrite' : 'accept',
    reasons: uniqueNormalized(reasons),
    rewriteGoals: uniqueGoals.length ? uniqueGoals : ['Preserve the strongest angle and keep the writing sharp.'],
  }
}

function rewriteCarouselFromCritique(
  carousel: Carousel,
  brief: Brief,
  idea: Idea,
  critique: EditorialCritique,
  usedBatchTitles: Set<string> = new Set(),
): Carousel {
  const richnessBonus = idea.wordCount >= 96 ? 2 : idea.wordCount >= 64 ? 1 : 0
  const totalSlides = Math.max(MIN_CAROUSEL_SLIDES, Math.min(carousel.slides.length, Math.min(MAX_CAROUSEL_SLIDES, MIN_CAROUSEL_SLIDES + richnessBonus)))
  const trimmedSlides = carousel.slides.slice(0, totalSlides).map((slide) => ({ ...slide }))
  const slides = trimmedSlides.map((slide, index) => {
    const rewrittenTitle = rewriteSlideTitle(slide.title, brief, critique, index, totalSlides)
    const rewrittenBody = rewriteSlideBody(slide.body, brief, critique, index, totalSlides)
    return {
      ...slide,
      title: rewrittenTitle,
      body: rewrittenBody,
    }
  })

  return editorialPolishCarousel(brief, {
    ...carousel,
    title: titleBaseFromSlides(slides),
    slides,
  }, usedBatchTitles)
}

function rewriteSlideTitle(title: string, brief: Brief, critique: EditorialCritique, index: number, totalSlides: number) {
  if (index === 0) {
    return chooseOpeningTitle([
      brief.thesis,
      title,
      brief.whyItMatters,
    ])
  }
  if (index === 1) {
    return pickDisplayLine(uniqueNormalized([
      brief.whyItMatters,
      title,
      brief.supportPoints[0] ?? '',
    ]), { preferredMax: 84 }) || fallbackTitleForPosition(index, brief, totalSlides)
  }
  if (index === totalSlides - 1) {
    return pickDisplayLine(uniqueNormalized([
      buildClosingFallback(brief),
      titleFromSentence(brief.supportPoints[2] ?? ''),
      titleFromSentence(brief.supportPoints[1] ?? ''),
      brief.supportPoints[2] ?? '',
      brief.supportPoints[1] ?? '',
      title,
    ]), { preferredMax: 84 }) || buildClosingFallback(brief)
  }

  const supportIndex = Math.max(0, index - 2)
  return pickDisplayLine(uniqueNormalized([
    titleFromSentence(brief.supportPoints[supportIndex] ?? ''),
    brief.supportPoints[supportIndex] ?? '',
    title,
    fallbackTitleForPosition(index, brief, totalSlides),
  ]), { preferredMax: 84 }) || titleFromSentence(brief.supportPoints[supportIndex] ?? '') || fallbackTitleForPosition(index, brief, totalSlides) || 'The workflow changes here.'
}

function rewriteSlideBody(body: string, brief: Brief, critique: EditorialCritique, index: number, totalSlides: number) {
  const cleaned = splitSlideBodyLines(polishSlideBody(body, index, totalSlides))
  if (index === 0) return ''
  if (index === 1) {
    return buildBodyLines([
      brief.whyItMatters,
      cleaned[0] ?? brief.supportPoints[0] ?? '',
    ])
  }
  if (index === totalSlides - 1) {
    return buildBodyLines([
      brief.supportPoints[Math.min(2, brief.supportPoints.length - 1)] ?? cleaned[0] ?? '',
      'The edge is better judgment, not louder tooling.',
    ])
  }

  const supportIndex = Math.max(0, index - 2)
  return buildBodyLines([
    brief.supportPoints[supportIndex] ?? cleaned[0] ?? '',
    cleaned[0] ?? brief.whyItMatters,
  ])
}

function splitSlideBodyLines(body: string) {
  return uniqueNormalized(body
    .split(/\n\n+/)
    .flatMap((part) => part.split(/\n+/))
    .map((part) => part.replace(/^>\s*/, '').replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim()))
}

function shortenBodyLine(line: string) {
  const cleaned = normalizeForSlide(line)
  if (!cleaned) return ''

  const concise = pickDisplayLine([
    cleaned,
    ...splitIntoClauses(cleaned),
  ], { preferredMax: 72 })

  return normalizeForSlide(concise || cleaned)
}

function buildBodyLines(lines: string[]) {
  return uniqueNormalized(lines.map((line) => shortenBodyLine(line)))
    .filter((line) => !/[.…]$/.test(line) || /[.!?]$/.test(line))
    .slice(0, TARGET_BODY_LINES)
    .join('\n\n')
}

function polishSlideBody(body: string, index: number, totalSlides = 5) {
  const blocks = body
    .split(/\n\n+/)
    .map((part) => normalizeForSlide(part))
    .filter(Boolean)
    .filter((part) => !/^audience:/i.test(part))
    .filter((part) => part !== 'Use the source package as evidence, not as final copy.')
    .filter((part) => part !== 'Then sharpen the thesis until it actually sounds like Maurilio, not a transcript.')

  if (index === 0) return ''

  if (index === totalSlides - 1) {
    return blocks.slice(0, 2).join('\n\n')
  }

  return blocks.slice(0, 2).join('\n\n')
}

function fallbackTitleForPosition(index: number, brief: Brief, totalSlides = 5) {
  if (index === 0) return brief.thesis
  if (index === 1) return brief.whyItMatters
  if (index === totalSlides - 1) return buildClosingFallback(brief)
  if (index === totalSlides - 2) return brief.supportPoints[1] ?? 'The operating model has to change.'
  if (index === 2) return brief.supportPoints[0] ?? 'This is where the real shift shows up.'
  return 'Untitled slide'
}

function buildClosingFallback(brief: Brief) {
  return pickDisplayLine(uniqueNormalized([
    brief.supportPoints[2] ?? '',
    brief.supportPoints[1] ?? '',
    brief.whyItMatters,
    brief.thesis,
  ]), { preferredMax: 84 }) || closingReserveTitle(brief)
}

function closingReserveTitle(brief: Brief) {
  const lead = [
    'The edge is',
    'Winning teams build',
    'The moat becomes',
    'The leverage shifts to',
    'Strong operators need',
  ]
  const tail = [
    'tighter review loops.',
    'clearer human checkpoints.',
    'faster escalation paths.',
    'better supervision habits.',
    'smarter audit rhythms.',
    'more disciplined fallback rules.',
  ]
  const hash = brief.id.split('').reduce((total, char) => total + char.charCodeAt(0), 0)
  return `${lead[hash % lead.length]} ${tail[Math.floor(hash / lead.length) % tail.length]}`
}

function ensureCarouselProgression(brief: Brief, slides: CarouselSlide[], usedBatchTitles: Set<string> = new Set()) {
  if (slides.length === 0) return slides
  const updated = [...slides]

  if (updated.length >= 2 && !updated[1].body.trim()) {
    updated[1] = { ...updated[1], body: brief.whyItMatters }
  }

  if (updated.length >= 5) {
    const closingBody = [
      brief.supportPoints[2] ?? '',
      brief.audience.replace(/^Audience:\s*/i, ''),
    ].filter(Boolean).join('\n\n')
    const earlierTitles = new Set(updated.slice(0, 4).map((slide) => cleanSentence(slide.title).toLowerCase()).filter(Boolean))
    const closingTitle = pickUniqueTitle(new Set(earlierTitles), [
      isWeakDisplayLine(updated[4].title) ? '' : updated[4].title,
      brief.supportPoints[2] ?? '',
      brief.supportPoints[1] ?? '',
      buildClosingFallback(brief),
      closingReserveTitle(brief),
    ], usedBatchTitles)

    updated[4] = {
      ...updated[4],
      title: closingTitle,
      body: polishSlideBody(updated[4].body, 4) || closingBody,
    }
  }

  return updated
}


function pickUniqueTitle(usedTitles: Set<string>, candidates: string[], reservedTitles: Set<string> = new Set()) {
  const normalizedCandidates = candidates
    .map((candidate) => cleanSentence(candidate))
    .filter(Boolean)

  for (const candidate of normalizedCandidates) {
    const key = candidate.toLowerCase()
    if (isWeakDisplayLine(candidate) || usedTitles.has(key) || reservedTitles.has(key)) continue
    usedTitles.add(key)
    reservedTitles.add(key)
    return candidate
  }

  const uniqueFallback = normalizedCandidates.find((candidate) => !usedTitles.has(candidate.toLowerCase()) && !reservedTitles.has(candidate.toLowerCase()))
  if (uniqueFallback) {
    const fallbackKey = uniqueFallback.toLowerCase()
    usedTitles.add(fallbackKey)
    reservedTitles.add(fallbackKey)
    return uniqueFallback
  }

  const base = normalizedCandidates[0] || 'Untitled slide'
  const synthesizedFallback = synthesizeUniqueTitleVariant(base, normalizedCandidates.slice(1), usedTitles, reservedTitles)
  const fallbackKey = synthesizedFallback.toLowerCase()
  usedTitles.add(fallbackKey)
  reservedTitles.add(fallbackKey)
  return synthesizedFallback
}

function synthesizeUniqueTitleVariant(
  base: string,
  alternates: string[],
  usedTitles: Set<string>,
  reservedTitles: Set<string>,
) {
  const disallowed = new Set([...usedTitles, ...reservedTitles])
  const baseStem = buildDistinctTitleStem([base, ...alternates], disallowed)
  const strategicVariants = buildStrategicReserveTitleVariants(baseStem, alternates)

  for (const variant of strategicVariants) {
    const cleaned = cleanSentence(variant)
    const key = cleaned.toLowerCase()
    if (!cleaned || isWeakDisplayLine(cleaned) || disallowed.has(key)) continue
    return cleaned
  }

  const reserveSuffixes = [
    'for operators',
    'in production',
    'when context drifts',
    'once the workflow shifts',
    'before the next handoff',
    'under real load',
  ]

  for (const suffix of reserveSuffixes) {
    const variant = cleanSentence(`${baseStem} — ${suffix}`)
    const key = variant.toLowerCase()
    if (!variant || isWeakDisplayLine(variant) || disallowed.has(key)) continue
    return variant
  }

  let counter = 2
  while (counter < 20) {
    const variant = cleanSentence(`${baseStem} (${counter})`)
    const key = variant.toLowerCase()
    if (!disallowed.has(key)) return variant
    counter += 1
  }

  return `${baseStem} (${Date.now()})`
}

function buildStrategicReserveTitleVariants(baseStem: string, alternates: string[]) {
  const combined = uniqueNormalized([baseStem, ...alternates]).join(' ')
  const topic = inferReserveTitleTopic(combined)
  const emphasis = inferReserveTitleEmphasis(combined)
  const strategic = extractStrategicFallbackThesis([baseStem, ...alternates])
  const subject = topic.articleless
  const subjectWithArticle = topic.withArticle
  const topicLabel = topic.label
  const anchor = inferReserveTitleAnchor(combined)
  const anchorLabel = anchor ? capitalize(anchor) : ''

  return uniqueNormalized([
    anchor ? `${anchorLabel} changes where human judgment belongs.` : '',
    anchor ? `${anchorLabel} makes stale coordination visible.` : '',
    anchor ? `${anchorLabel} gets expensive when review stays lazy.` : '',
    anchor ? `${anchorLabel} is where the workflow starts to break.` : '',
    `${subjectWithArticle} changes where human judgment belongs.`,
    `${subject} puts the old workflow under pressure.`,
    `${subject} makes the review layer more valuable.`,
    `${subject} exposes where coordination is still leaking time.`,
    `${subjectWithArticle} changes what deserves a human checkpoint.`,
    `${subject} raises the cost of stale operating assumptions.`,
    `${subject} rewards teams that update supervision faster.`,
    `${capitalize(topicLabel)} shifts the bottleneck toward ${emphasis}.`,
    `${capitalize(topicLabel)} now punishes lazy handoffs.`,
    `${capitalize(topicLabel)} gets expensive when the workflow stays stale.`,
    strategic,
    baseStem,
  ])
}

function inferReserveTitleAnchor(text: string) {
  const tokens = tokenizeReserveTitleAnchor(text)
  if (tokens.length === 0) return ''

  const preferredPhrase = findPreferredReserveAnchorPhrase(tokens)
  if (preferredPhrase) return preferredPhrase

  const viableSingle = tokens.find((token) => scoreReserveAnchorToken(token) > 0)
  return viableSingle ?? ''
}

function tokenizeReserveTitleAnchor(text: string) {
  return cleanSentence(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 4)
    .filter((token) => !RESERVE_TITLE_STOP_WORDS.has(token))
}

function findPreferredReserveAnchorPhrase(tokens: string[]) {
  const candidates: Array<{ phrase: string; score: number; length: number }> = []

  for (let index = 0; index < tokens.length; index += 1) {
    for (let size = 3; size >= 2; size -= 1) {
      const window = tokens.slice(index, index + size)
      if (window.length !== size) continue
      const score = scoreReserveAnchorPhrase(window)
      if (score <= 0) continue
      candidates.push({ phrase: window.join(' '), score, length: window.length })
    }
  }

  candidates.sort((left, right) => right.score - left.score || right.length - left.length)
  return candidates[0]?.phrase ?? ''
}

function scoreReserveAnchorPhrase(tokens: string[]) {
  if (tokens.length < 2) return Number.NEGATIVE_INFINITY
  if (new Set(tokens).size !== tokens.length) return Number.NEGATIVE_INFINITY
  if (tokens.some((token) => RESERVE_TITLE_ANCHOR_BANNED.has(token))) return Number.NEGATIVE_INFINITY

  let score = 0
  let domainHits = 0

  for (const token of tokens) {
    const tokenScore = scoreReserveAnchorToken(token)
    if (tokenScore <= -4) return Number.NEGATIVE_INFINITY
    if (tokenScore > 0) domainHits += 1
    score += tokenScore
  }

  if (domainHits === 0) return Number.NEGATIVE_INFINITY
  if (domainHits >= 2) score += 4
  if (tokens.length === 3) score += 1

  return score
}

function scoreReserveAnchorToken(token: string) {
  if (!token) return Number.NEGATIVE_INFINITY
  if (RESERVE_TITLE_ANCHOR_BANNED.has(token)) return -10
  if (RESERVE_TITLE_ANCHOR_WEAK.has(token)) return -6
  if (RESERVE_TITLE_ANCHOR_DOMAIN.test(token)) return 4
  if (/(tion|sion|ment|ness|ship|ware|graph|proof|bench|guard|scope|stack|trace|queue|cache|token|trust|sales|buyer|agent|model|prompt|memory|context|review|audit|deploy|robot|voice|class|teach|student|build|checkpoint)$/i.test(token)) return 3
  if (token.length >= 8) return 1
  return 0
}

function inferReserveTitleTopic(text: string) {
  const normalized = cleanSentence(text).toLowerCase()
  if (/\b(agent|workflow|review|memory|handoff|context|prompt|supervis)\w*\b/.test(normalized)) {
    return { label: 'agent workflow', articleless: 'Agent workflow pressure', withArticle: 'Agent workflow pressure' }
  }
  if (/\b(model|eval|benchmark|inference|training|compute|gpu|token|latency)\w*\b/.test(normalized)) {
    return { label: 'model progress', articleless: 'Model progress', withArticle: 'Model progress' }
  }
  if (/\b(product|engineering|designer|manager|org|team|company|operator|software)\w*\b/.test(normalized)) {
    return { label: 'team redesign', articleless: 'Team redesign', withArticle: 'Team redesign' }
  }
  if (/\b(sales|buyer|customer|market|enterprise|consult)\w*\b/.test(normalized)) {
    return { label: 'buyer behavior', articleless: 'Buyer behavior', withArticle: 'Buyer behavior' }
  }
  if (/\b(robot|robotics|classroom|teacher|student|voice|video|demo)\w*\b/.test(normalized)) {
    return { label: 'product demo velocity', articleless: 'Product demo velocity', withArticle: 'Product demo velocity' }
  }
  return { label: 'capability shift', articleless: 'Capability shift', withArticle: 'Capability shift' }
}

function inferReserveTitleEmphasis(text: string) {
  const normalized = cleanSentence(text).toLowerCase()
  if (/\b(review|checkpoint|approve|audit|supervis)\w*\b/.test(normalized)) return 'human review'
  if (/\b(memory|context|docs|prd|history|snapshot)\w*\b/.test(normalized)) return 'context quality'
  if (/\b(sales|buyer|customer|market|enterprise)\w*\b/.test(normalized)) return 'buyer trust'
  if (/\b(model|eval|benchmark|latency|compute|gpu)\w*\b/.test(normalized)) return 'system design'
  return 'operator judgment'
}

function capitalize(value: string) {
  return value ? `${value[0].toUpperCase()}${value.slice(1)}` : value
}

function buildDistinctTitleStem(candidates: string[], disallowed: Set<string>) {
  const cleanedCandidates = uniqueNormalized(candidates)
    .map((candidate) => stripReserveSuffixes(candidate))
    .map((candidate) => trimSentence(candidate.replace(/[.!?]+$/g, ''), 62) || '')
    .filter(Boolean)

  for (const candidate of cleanedCandidates) {
    const key = candidate.toLowerCase()
    if (key && !disallowed.has(key) && !isWeakDisplayLine(candidate)) {
      return candidate
    }
  }

  const strategic = extractStrategicFallbackThesis(cleanedCandidates)
  const cleanedStrategic = trimSentence(stripReserveSuffixes(strategic), 62) || ''
  if (cleanedStrategic && !disallowed.has(cleanedStrategic.toLowerCase()) && !isWeakDisplayLine(cleanedStrategic)) {
    return cleanedStrategic
  }

  return trimSentence(stripReserveSuffixes(cleanedCandidates[0] ?? ''), 62) || 'Untitled slide'
}

function stripReserveSuffixes(value: string) {
  return cleanSentence(value)
    .replace(/(?:\s*[—–-]\s*(?:for operators|in production|when context drifts|once the workflow shifts|before the next handoff|under real load))+$/i, '')
    .replace(/(?:\s*\(\d+\))+$/g, '')
    .trim()
}

function chooseOpeningTitle(candidates: string[]) {
  const normalizedCandidates = candidates
    .map((candidate) => cleanSentence(candidate))
    .filter(Boolean)

  const strong = normalizedCandidates.find((candidate) => !isWeakDisplayLine(candidate) && candidate.length <= 84)
  if (strong) return strong

  const picked = pickDisplayLine(normalizedCandidates, { preferredMax: 84 })
  if (picked && !isWeakDisplayLine(picked)) return picked

  const fallback = normalizedCandidates.find((candidate) => candidate.length >= 28)
  return fallback || 'AI operating models are getting stale faster than most teams realize.'
}

function buildQuoteBody(lines: string[]) {
  const normalized = uniqueNormalized(lines).slice(0, 2)
  const [quote, support] = normalized
  return [quote ? `> ${quote}` : undefined, support].filter(Boolean).join('\n\n')
}

function buildFrameworkBody(intro: string, items: string[]) {
  const normalizedItems = uniqueNormalized(items).slice(0, 3)
  const list = normalizedItems.map((item, index) => `${index + 1}. ${item}`).join('\n')
  return [normalizeForSlide(intro), list].filter(Boolean).join('\n\n')
}

function uniqueNormalized(lines: string[]) {
  const seen = new Set<string>()
  const result: string[] = []

  for (const line of lines) {
    const cleaned = normalizeForSlide(line)
    const key = cleaned.toLowerCase()
    if (!cleaned || seen.has(key)) continue
    seen.add(key)
    result.push(cleaned)
  }

  return result
}

const RESERVE_TITLE_STOP_WORDS = new Set([
  'about', 'after', 'again', 'already', 'because', 'before', 'being', 'changes', 'closer', 'context', 'could', 'deserves', 'every', 'faster', 'human', 'judgment', 'layer', 'makes', 'model', 'operators', 'pressure', 'really', 'review', 'shifts', 'stale', 'still', 'teams', 'than', 'that', 'their', 'there', 'these', 'they', 'this', 'those', 'under', 'workflow', 'where', 'with', 'your',
])

const RESERVE_TITLE_ANCHOR_BANNED = new Set([
  'agent', 'agents', 'capability', 'company', 'coordination', 'faster', 'human', 'judgment', 'layer', 'model', 'operators', 'pressure', 'review', 'shift', 'shifts', 'stale', 'supervision', 'teams', 'workflow',
])

const RESERVE_TITLE_ANCHOR_WEAK = new Set([
  'about', 'after', 'before', 'being', 'better', 'build', 'changes', 'closer', 'deserves', 'edge', 'every', 'getting', 'going', 'happens', 'important', 'keeps', 'making', 'people', 'puts', 'raises', 'really', 'rewards', 'starts', 'still', 'thing', 'things', 'update', 'visible', 'what', 'when', 'where', 'which', 'winning', 'works',
])

const RESERVE_TITLE_ANCHOR_DOMAIN = /^(memory|context|prompt|injection|snapshot|version|eval|benchmark|latency|compute|gpu|token|browser|spreadsheet|robot|robotics|classroom|teacher|student|buyer|customer|market|sales|trust|handoff|handoffs|checkpoint|approval|audit|docs|prd|history|deployment|deployments|operator|operators|founder|founders|manager|managers|engineering|engineer|design|designer|product|security|sandbox|permission|permissions|transcript|transcripts|carousel|carousels|voice|audio|video|modeling|inference|training)$/i

function normalizeForSlide(text: string) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/^[-–—:;,\s]+/, '')
    .replace(/^(?:and|but|so|because|well)\b\s+/i, '')
    .replace(/^(?:really|honestly|frankly),?\s+/i, '')
    .replace(/\b(?:you know|sort of|kind of)\b/gi, '')
    .replace(/\s+([,.!?;:])/g, '$1')
    .trim()
}

function titleFromSentence(text: string) {
  const cleaned = cleanSentence(text)
  if (!cleaned) return ''

  const clauses = splitIntoClauses(cleaned)
    .flatMap((part) => {
      const normalized = cleanSentence(part)
      const stripped = stripWeakLeadIn(normalized)
      return uniqueNormalized([normalized, stripped, compressTitleCandidate(normalized), compressTitleCandidate(stripped)])
    })
    .filter(Boolean)
    .filter((part) => !isWeakDisplayLine(part))
    .sort((a, b) => scoreDisplayCandidate(b) - scoreDisplayCandidate(a) || b.length - a.length)

  const strippedSentence = compressTitleCandidate(stripWeakLeadIn(cleaned))
  if (strippedSentence && !isWeakDisplayLine(strippedSentence)) {
    return strippedSentence
  }

  return clauses[0] ?? compressTitleCandidate(cleaned)
}

function compressTitleCandidate(text: string) {
  const cleaned = cleanSentence(text)
  if (!cleaned) return ''

  const direct = pickDisplayLine([cleaned], { preferredMax: 84 })
  if (direct && !isWeakDisplayLine(direct)) return direct

  const clauses = splitIntoClauses(cleaned)
    .map((part) => cleanSentence(part))
    .filter(Boolean)
    .filter((part) => !isWeakDisplayLine(part))
    .sort((a, b) => scoreDisplayCandidate(b) - scoreDisplayCandidate(a) || b.length - a.length)

  return clauses[0] ?? trimmedMeaningfulWindow(cleaned)
}

function trimmedMeaningfulWindow(text: string) {
  const tokens = cleanSentence(text).split(/\s+/).filter(Boolean)
  if (tokens.length <= 14) return cleanSentence(text)

  for (let start = 0; start <= Math.max(0, tokens.length - 8); start += 1) {
    const window = cleanSentence(tokens.slice(start, Math.min(tokens.length, start + 12)).join(' '))
    if (window && !isWeakDisplayLine(window) && window.length <= 84) {
      return window
    }
  }

  return trimSentence(text, 84)
}

function titleFromIdea(idea: Idea, fallback: string) {
  const candidates = [
    titleFromSentence(idea.hook),
    titleFromSentence(idea.titleSuggestion),
    ...getCompleteThoughts(idea.text).map((sentence) => titleFromSentence(sentence)),
    fallback,
  ]

  return candidates.find((candidate) => candidate && !isWeakDisplayLine(candidate)) ?? fallback
}

function extractTakeaway(primaryText: string, segments: Segment[]) {
  const candidate = [
    ...splitSentences(primaryText),
    ...segments.map((segment) => segment.hook),
  ].find((sentence) => /\b(skill|attention|boundary|calibration|system|workflow|operators?)\b/i.test(sentence))

  return candidate ?? ''
}

function pickDistinctThesis(candidates: string[], usedTheses: Set<string>) {
  const normalized = candidates
    .flatMap((candidate) => {
      const cleaned = cleanSentence(candidate)
      const stripped = stripWeakLeadIn(cleaned)
      return uniqueNormalized([cleaned, stripped])
    })
    .filter(Boolean)
  for (const candidate of normalized) {
    const key = slugify(candidate)
    if (!isWeakDisplayLine(candidate) && !isWeakBriefLineCandidate(candidate) && !usedTheses.has(key)) {
      usedTheses.add(key)
      return candidate
    }
  }

  const viableFallback = normalized.find((candidate) => !isWeakBriefLineCandidate(candidate) && !usedTheses.has(slugify(candidate)))
  if (viableFallback) {
    usedTheses.add(slugify(viableFallback))
    return viableFallback
  }

  const reserveFallbacks = [
    extractStrategicFallbackThesis(normalized),
    'A stronger operating model beats a stale workflow.',
    'The workflow changed faster than most org charts did.',
    'The real bottleneck is no longer where most teams think it is.',
  ].map((candidate) => cleanSentence(candidate)).filter(Boolean)

  for (const fallback of reserveFallbacks) {
    const key = slugify(fallback)
    if (!usedTheses.has(key)) {
      usedTheses.add(key)
      return fallback
    }
  }

  const lastResort = reserveFallbacks[0] ?? 'A stronger operating model beats a stale workflow.'
  usedTheses.add(slugify(lastResort))
  return lastResort
}

function extractStrategicFallbackThesis(candidates: string[]) {
  const combined = candidates.join(' ')
  if (/\b(product|engineering|design|operator|manager|software)\b/i.test(combined)) {
    return 'As AI gets closer to the product, coordination overhead becomes easier to spot.'
  }
  if (/\b(agent|workflow|review|handoff|context|memory)\b/i.test(combined)) {
    return 'When the workflow changes, the review layer becomes the real operating leverage.'
  }
  if (/\b(model|compute|inference|gpu|training|eval)\b/i.test(combined)) {
    return 'The edge shifts when model capability changes faster than the old playbook.'
  }
  return 'A stronger operating model beats a stale workflow.'
}

function briefClaimOverlap(left: Brief, right: Brief) {
  const leftClaim = [left.thesis, left.whyItMatters, ...left.supportPoints].join(' ')
  const rightClaim = [right.thesis, right.whyItMatters, ...right.supportPoints].join(' ')
  return overlapScore(leftClaim, rightClaim)
}

function inferAudience(primary: string, support: Idea[]) {
  const combined = `${primary} ${support.map((idea) => idea.text).join(' ')}`.toLowerCase()
  if (/organization|team|manager|operator|workflow|domain/.test(combined)) return 'Audience: operators, team leads, and founders redesigning AI-assisted workflows.'
  if (/product manager|designer|engineer/.test(combined)) return 'Audience: product, design, and engineering leaders figuring out where AI changes the work.'
  return 'Audience: people using AI in real work, not just talking about it.'
}

function inferWhyItMatters(primary: Idea, support: Idea[], thesis: string, usedWhy: Set<string>) {
  const thesisKey = slugify(thesis)
  const candidates = uniqueNormalized([
    ...getCompleteThoughts(primary.text),
    ...support.flatMap((idea) => getCompleteThoughts(idea.text)),
    extractTakeaway(primary.text, support),
    'If your mental model is stale, you redesign the wrong part of the workflow.',
  ])

  for (const candidate of candidates) {
    const key = slugify(candidate)
    if (key === thesisKey) continue
    if (usedWhy.has(key)) continue
    if (isWeakDisplayLine(candidate) || isWeakBriefLineCandidate(candidate)) continue
    usedWhy.add(key)
    return candidate
  }

  const fallback = 'If your mental model is stale, you redesign the wrong part of the workflow.'
  usedWhy.add(slugify(fallback))
  return fallback
}

function buildSupportPoints(
  primary: Idea,
  support: Idea[],
  usedSupport: Set<string>,
  usedSupportLines: string[],
  thesis: string,
  whyItMatters: string,
) {
  const reserved = new Set([slugify(thesis), slugify(whyItMatters)])
  const points = uniqueNormalized([
    ...getCompleteThoughts(primary.text).slice(1),
    ...support.flatMap((idea) => getCompleteThoughts(idea.text).slice(0, 2)),
    titleFromSentence(primary.titleSuggestion),
    titleFromSentence(primary.hook),
    extractTakeaway(primary.text, support),
  ])
    .map((line) => sanitizeSupportCandidate(line))
    .filter(Boolean)
    .filter((line) => !reserved.has(slugify(line)))
    .filter((line) => !isWeakDisplayLine(line))
    .filter((line) => !isWeakBriefLineCandidate(line))

  const selected: string[] = []
  for (const point of points) {
    const key = slugify(point)
    if (usedSupport.has(key)) continue
    if (usedSupportLines.some((existing) => overlapScore(existing, point) >= 0.68)) continue
    usedSupport.add(key)
    usedSupportLines.push(point)
    selected.push(point)
    if (selected.length >= 4) break
  }

  if (selected.length >= 2) return selected

  const backfillPoints = uniqueNormalized([
    ...splitIntoClauses(primary.text),
    ...splitIntoClauses(primary.hook),
    ...splitIntoClauses(primary.titleSuggestion),
    ...support.flatMap((idea) => splitIntoClauses(idea.text).slice(0, 2)),
  ])
    .map((line) => sanitizeSupportCandidate(line))
    .filter(Boolean)
    .filter((line) => !reserved.has(slugify(line)))
    .filter((line) => !isWeakSupportBackfill(line))

  for (const point of backfillPoints) {
    const key = slugify(point)
    if (usedSupport.has(key)) continue
    if (usedSupportLines.some((existing) => overlapScore(existing, point) >= 0.68)) continue
    if (selected.some((existing) => overlapScore(existing, point) >= 0.72)) continue
    usedSupport.add(key)
    usedSupportLines.push(point)
    selected.push(point)
    if (selected.length >= 3) break
  }

  if (selected.length > 0) return selected.slice(0, 4)
  return points.slice(0, 4)
}

function sanitizeSupportCandidate(value: string) {
  const direct = cleanSentence(value)
  const fragments = [
    direct,
    ...splitSentences(value).map((line) => cleanSentence(line)),
    ...splitIntoClauses(value).map((line) => cleanSentence(line)),
  ].filter(Boolean)

  for (const fragment of fragments) {
    const variants = uniqueNormalized([
      fragment,
      stripWeakLeadIn(fragment),
    ])

    for (const candidate of variants) {
      if (isMetaNarrationLine(candidate)) continue
      if (isWeakBriefLineCandidate(candidate)) continue
      return candidate
    }
  }

  return ''
}

function isWeakSupportBackfill(value: string) {
  const line = normalizeForSlide(value)
  if (!line) return true
  if (line.length < 32) return true
  if (/\?$/.test(line)) return true
  if (/^(for|to|and|but|or|so|because)\b/i.test(line)) return true
  if (/^(i'm|i am|we're|we are|this is where|think about|if you are)\b/i.test(line) && line.length < 80) return true
  return false
}

function buildCarouselSlug(sourceSlug: string, segment: Segment) {
  const segmentToken = `${segment.id}-${segment.start.replace(/:/g, '-')}`
  const angleSlug = slugify(segment.titleSuggestion || segment.hook || segment.id).slice(0, 24) || segment.id
  const maxLength = 80
  const reserved = `--${segmentToken}-${angleSlug}`
  const maxSourceLength = Math.max(12, maxLength - reserved.length)
  const normalizedSourceSlug = sourceSlug.slice(0, maxSourceLength).replace(/-+$/g, '') || 'youtube-source'
  return `${normalizedSourceSlug}${reserved}`
}

async function readSourceManifest(sourceDir: string) {
  try {
    const raw = await readFile(path.join(sourceDir, 'source.json'), 'utf8')
    return JSON.parse(raw) as SourceManifest
  } catch {
    return undefined
  }
}

async function removeStalePublishedArtifacts(
  previousCarousels: Array<{ slug?: string }>,
  nextBundles: CarouselBundle[],
) {
  const nextSlugs = new Set(nextBundles.map((bundle) => bundle.carousel.slug))
  const staleSlugs = previousCarousels
    .map((entry) => entry.slug)
    .filter((slug): slug is string => Boolean(slug))
    .filter((slug) => !nextSlugs.has(slug))

  await Promise.all(staleSlugs.map(async (slug) => {
    await rm(path.resolve('carousels', slug), { recursive: true, force: true })
    await rm(path.resolve('public', 'exports', slug), { recursive: true, force: true })
    await rm(path.resolve('.pages-serve', REPO_NAME, 'carousel', slug), { recursive: true, force: true })
    await rm(path.resolve('out', 'carousel', slug), { recursive: true, force: true })
  }))
}

async function invalidateRenderedArtifacts(slugs: string[]) {
  const uniqueSlugs = [...new Set(slugs.filter(Boolean))]

  await Promise.all(uniqueSlugs.map(async (slug) => {
    await rm(path.resolve('public', 'exports', slug), { recursive: true, force: true })
    await rm(path.resolve('.pages-serve', REPO_NAME, 'carousel', slug), { recursive: true, force: true })
    await rm(path.resolve('out', 'carousel', slug), { recursive: true, force: true })
  }))
}

function renderRawTranscript(metadata: VideoMetadata, url: string, transcript: string) {
  return `# Raw Transcript\n\n- Title: ${metadata.title}\n- Creator: ${metadata.authorName ?? 'Unknown'}\n- URL: ${url}\n\n---\n\n${transcript.trim()}\n`
}

function renderCleanTranscript(metadata: VideoMetadata, paragraphs: string[]) {
  return `# Clean Transcript\n\n- Title: ${metadata.title}\n- Creator: ${metadata.authorName ?? 'Unknown'}\n\n---\n\n${paragraphs.map((paragraph) => `${paragraph}\n`).join('\n')}`
}

function renderCarouselMarkdown(carousel: Carousel) {
  const frontmatter = [
    '---',
    `slug: ${quoteYaml(carousel.slug)}`,
    `title: ${quoteYaml(carousel.title)}`,
    `description: ${quoteYaml(carousel.description)}`,
    `sourceType: ${carousel.sourceType}`,
    `aspectRatio: ${carousel.aspectRatio}`,
    `updatedAt: ${carousel.updatedAt}`,
    'theme:',
    `  accent: ${quoteYaml(carousel.theme.accent)}`,
    `  background: ${quoteYaml(carousel.theme.background)}`,
    `  foreground: ${quoteYaml(carousel.theme.foreground)}`,
    `  muted: ${quoteYaml(carousel.theme.muted)}`,
    '---',
  ].join('\n')

  const slides = carousel.slides.map((slide) => {
    const parts = [
      slide.eyebrow ? `eyebrow: ${slide.eyebrow}` : undefined,
      `# ${slide.title}`,
      slide.body.trim(),
    ].filter(Boolean)

    return parts.join('\n\n')
  })

  return `${frontmatter}\n\n${slides.join('\n\n---\n\n')}\n`
}

function quoteYaml(value: string) {
  return JSON.stringify(value)
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'youtube-source'
}
