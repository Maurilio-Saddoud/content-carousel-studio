import { execFile } from 'node:child_process'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
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

type Brief = {
  id: string
  primaryIdeaId: string
  supportingIdeaIds: string[]
  thesis: string
  audience: string
  whyItMatters: string
  supportPoints: string[]
  distinctFromBriefIds: string[]
  carouselSlug?: string
  diagnostics?: {
    focusScore: number
    overlapWithEarlierBriefs: number
    overlapWithNearestBriefId?: string
    supportIdeaDistance: number[]
  }
}

type DroppedBrief = Brief & {
  dropReasons: string[]
}

type BriefBuildResult = {
  briefs: Brief[]
  droppedBriefs: DroppedBrief[]
}

type CarouselBundle = {
  brief: Brief
  idea: Idea
  carousel: Carousel
}

type ExistingSlugMap = Record<string, string>
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
  selectedSegmentIds?: string[]
  briefs?: Array<{ id?: string; primaryIdeaId?: string; thesis?: string; slug?: string }>
  droppedBriefs?: Array<{ id?: string; primaryIdeaId?: string; thesis?: string; focusScore?: number; overlapWithEarlierBriefs?: number; overlapWithNearestBriefId?: string; dropReasons?: string[] }>
  carousels?: Array<{ segmentId?: string; slug?: string; title?: string; previewPath?: string; carouselPath?: string }>
  createdFiles?: string[]
}

const TRANSCRIPT_TOOL_PATH = path.resolve('../youtube-transcript-v1/yt_transcript.py')
const RAW_TRANSCRIPT_RE = /^\[(\d{2}):(\d{2}):(\d{2})\]\s+(.*)$/
const execFileAsync = promisify(execFile)
const REPO_NAME = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'content-carousel-studio'
const DEFAULT_THEME = {
  accent: '#1D9BF0',
  background: '#000000',
  foreground: '#E7E9EA',
  muted: '#71767B',
}
const PREFERRED_BRIEF_LINE_MAX = 160
const HARD_BRIEF_LINE_MAX = 180
const MIN_BRIEF_FOCUS_SCORE = 0.14

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
  const viableIdeas = ideas.filter((idea) => idea.status !== 'rejected')

  if (viableIdeas.length === 0) {
    throw new Error('Could not find any usable transcript segments after editorial filtering.')
  }

  const { briefs, droppedBriefs } = buildBriefs(viableIdeas, ideas, sourceSlug, args.maxSegments, existingSlugs)
  const repoTitleReservations = await collectRepoTitleReservations(new Set(Object.values(existingSlugs)))
  const carouselBundles = await buildCarouselBundles(metadata, sourceSlug, briefs, ideas, repoTitleReservations)
  const acceptedIdeaIds = carouselBundles.map((bundle) => bundle.idea.id)
  const normalizedIdeas: Idea[] = ideas.map((idea) => {
    if (acceptedIdeaIds.includes(idea.id)) {
      return {
        ...idea,
        status: 'published' as const,
        selectionReason: idea.status === 'published'
          ? idea.selectionReason
          : 'Promoted from viable idea pool after brief selection found stronger distinct/focused territory.',
        carouselSlug: existingSlugs[idea.id] || idea.carouselSlug || buildCarouselSlug(sourceSlug, idea),
      }
    }

    if (idea.status === 'published') {
      return { ...idea, status: 'candidate' as const, selectionReason: `${idea.selectionReason} Dropped after brief overlap/focus filtering.`.trim() }
    }

    return idea
  })
  await removeStalePublishedArtifacts(previousManifest?.carousels ?? [], carouselBundles)
  await invalidateDerivedArtifactsForBundles(carouselBundles)

  for (const bundle of carouselBundles) {
    await mkdir(path.resolve('carousels', bundle.carousel.slug), { recursive: true })
    await writeFile(path.resolve('carousels', bundle.carousel.slug, 'carousel.md'), renderCarouselMarkdown(bundle.carousel), 'utf8')
  }
  await syncCarouselDirectoryIndex()

  const summary = buildSummary(metadata, sourceSlug, carouselBundles, normalizedIdeas, briefs, droppedBriefs)

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
    droppedBriefs: droppedBriefs.map((brief) => ({
      id: brief.id,
      primaryIdeaId: brief.primaryIdeaId,
      thesis: brief.thesis,
      focusScore: brief.diagnostics?.focusScore,
      overlapWithEarlierBriefs: brief.diagnostics?.overlapWithEarlierBriefs,
      overlapWithNearestBriefId: brief.diagnostics?.overlapWithNearestBriefId,
      dropReasons: brief.dropReasons,
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
  const segments = await loadSegmentsForRebuild(sourceDir)
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
  const viableIdeas = ideas.filter((idea) => idea.status !== 'rejected')
  const { briefs, droppedBriefs } = buildBriefs(viableIdeas, ideas, sourceSlug, publishLimit, existingSlugs)
  const repoTitleReservations = await collectRepoTitleReservations(new Set(Object.values(existingSlugs)))
  const carouselBundles = await buildCarouselBundles(metadata, sourceSlug, briefs, ideas, repoTitleReservations)
  const acceptedIdeaIds = carouselBundles.map((bundle) => bundle.idea.id)
  const normalizedIdeas: Idea[] = ideas.map((idea) => {
    if (acceptedIdeaIds.includes(idea.id)) {
      return {
        ...idea,
        status: 'published' as const,
        selectionReason: idea.status === 'published'
          ? idea.selectionReason
          : 'Promoted from viable idea pool after brief selection found stronger distinct/focused territory.',
        carouselSlug: existingSlugs[idea.id] || idea.carouselSlug || buildCarouselSlug(sourceSlug, idea),
      }
    }

    if (idea.status === 'published') {
      return { ...idea, status: 'candidate' as const, selectionReason: `${idea.selectionReason} Dropped after brief overlap/focus filtering.`.trim() }
    }

    return idea
  })
  await removeStalePublishedArtifacts(sourceManifest.carousels ?? [], carouselBundles)
  await invalidateDerivedArtifactsForBundles(carouselBundles)
  await writeFile(path.join(sourceDir, 'segments.json'), `${JSON.stringify(segments, null, 2)}\n`, 'utf8')
  await writeFile(path.join(sourceDir, 'ideas.json'), `${JSON.stringify(normalizedIdeas, null, 2)}\n`, 'utf8')
  await writeFile(path.join(sourceDir, 'briefs.json'), `${JSON.stringify(briefs, null, 2)}\n`, 'utf8')

  for (const bundle of carouselBundles) {
    await mkdir(path.resolve('carousels', bundle.carousel.slug), { recursive: true })
    await writeFile(path.resolve('carousels', bundle.carousel.slug, 'carousel.md'), renderCarouselMarkdown(bundle.carousel), 'utf8')
  }
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
    droppedBriefs: droppedBriefs.map((brief) => ({
      id: brief.id,
      primaryIdeaId: brief.primaryIdeaId,
      thesis: brief.thesis,
      focusScore: brief.diagnostics?.focusScore,
      overlapWithEarlierBriefs: brief.diagnostics?.overlapWithEarlierBriefs,
      overlapWithNearestBriefId: brief.diagnostics?.overlapWithNearestBriefId,
      dropReasons: brief.dropReasons,
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
  await writeFile(path.join(sourceDir, 'summary.md'), buildSummary(metadata, sourceSlug, carouselBundles, normalizedIdeas, briefs, droppedBriefs), 'utf8')

  console.log(`Rebuilt ${carouselBundles.length} carousel${carouselBundles.length === 1 ? '' : 's'} for ${sourceSlug}`)
}

export async function syncSourceSummaryFromArgv(argv: string[] = process.argv.slice(2)) {
  const args = parseSummarySyncArgs(argv)

  if (args.repo) {
    const sourceRoot = path.resolve('sources')
    const entries = await readdir(sourceRoot, { withFileTypes: true })
    const slugs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort()

    for (const sourceSlug of slugs) {
      await syncSourceSummary(sourceSlug)
    }

    console.log(`Synced ${slugs.length} source summar${slugs.length === 1 ? 'y' : 'ies'}.`)
    return
  }

  if (!args.sourceSlug) {
    throw new Error('Usage: content-carousel sync-summary <source-slug> [--repo]')
  }

  await syncSourceSummary(args.sourceSlug)
  console.log(`Synced summary for ${args.sourceSlug}`)
}

async function syncSourceSummary(sourceSlug: string) {
  const sourceDir = path.resolve('sources', sourceSlug)
  const sourceManifest = JSON.parse(await readFile(path.join(sourceDir, 'source.json'), 'utf8')) as SourceManifest
  const ideas = JSON.parse(await readFile(path.join(sourceDir, 'ideas.json'), 'utf8')) as Idea[]
  const briefs = JSON.parse(await readFile(path.join(sourceDir, 'briefs.json'), 'utf8')) as Brief[]
  const summary = buildSummaryFromSourceArtifacts(sourceManifest, sourceSlug, ideas, briefs)
  await writeFile(path.join(sourceDir, 'summary.md'), summary, 'utf8')
}

function parseSummarySyncArgs(argv: string[]) {
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

  return args
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

async function loadSegmentsForRebuild(sourceDir: string) {
  try {
    const rawTranscript = await readFile(path.join(sourceDir, 'raw-transcript.md'), 'utf8')
    const transcriptLines = parseTranscript(rawTranscript)
    if (transcriptLines.length > 0) {
      return rankSegments(segmentTranscript(transcriptLines))
    }
  } catch {
    // Fall back to the stored segments snapshot when raw transcript is unavailable.
  }

  const segmentsRaw = await readFile(path.join(sourceDir, 'segments.json'), 'utf8')
  return refreshSegmentSuggestions(JSON.parse(segmentsRaw) as Segment[])
}

function normalizeText(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

function isSentenceBoundaryLine(text: string) {
  return /[.!?]["')\]]?$/.test(text.trim())
}

function findSegmentBoundary(lines: TranscriptLine[], start: number, splitAt: number, options: { gapTriggered: boolean }) {
  const fallback = Math.max(start, splitAt - 1)
  if (options.gapTriggered) {
    return fallback
  }

  const maxForwardLookahead = Math.min(lines.length - 1, splitAt + 6)
  let end = fallback

  while (end < maxForwardLookahead) {
    if (isSentenceBoundaryLine(lines[end].text)) {
      return end
    }

    const next = lines[end + 1]
    if (!next) break

    const projectedLength = end + 1 - start + 1
    const projectedChars = lines.slice(start, end + 2).reduce((sum, line) => sum + line.text.length, 0)
    const nextStartsFreshThought = /^[A-Z"'[(]/.test(next.text.trim()) && !/^(and|but|so|because|which|that|then|or)/i.test(next.text)
    if ((projectedLength > 14 || projectedChars > 1100) && nextStartsFreshThought) {
      break
    }

    end += 1
  }

  for (let index = fallback; index >= Math.max(start, fallback - 2); index -= 1) {
    if (isSentenceBoundaryLine(lines[index].text)) {
      return index
    }
  }

  return fallback
}

function trimSegmentTextToCompleteThoughts(text: string) {
  let trimmed = normalizeText(text)
  if (!trimmed) return ''

  const sentences = splitSentences(trimmed)
  if (sentences.length <= 1) {
    return trimmed
  }

  const firstSentence = cleanSentence(sentences[0] ?? '')
  if (firstSentence && (/^[a-z]/.test(firstSentence) || /^(and|but|so|because|which|that|then)\b/i.test(firstSentence))) {
    trimmed = sentences.slice(1).join(' ')
  }

  const updatedSentences = splitSentences(trimmed)
  if (updatedSentences.length > 1) {
    const lastSentence = cleanSentence(updatedSentences[updatedSentences.length - 1] ?? '')
    if (lastSentence && !/[.!?]["')\]]?$/.test(lastSentence)) {
      trimmed = updatedSentences.slice(0, -1).join(' ')
    }
  }

  return normalizeText(trimmed) || normalizeText(text)
}

function describeIdeaShapeIssues(text: string) {
  const sentences = splitSentences(normalizeText(text))
  if (sentences.length <= 1) {
    return [] as string[]
  }

  const issues: string[] = []
  const firstSentence = cleanSentence(sentences[0] ?? '')
  const lastSentence = cleanSentence(sentences[sentences.length - 1] ?? '')

  if (firstSentence && (/^[a-z]/.test(firstSentence) || /^(and|but|so|because|which|that|then)\b/i.test(firstSentence))) {
    issues.push('primary segment starts mid-thought')
  }

  if (lastSentence && !/[.!?]["')\]]?$/.test(lastSentence)) {
    issues.push('primary segment ends mid-thought')
  }

  return issues
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
  let i = 1

  while (i < lines.length) {
    const gap = lines[i].seconds - lines[i - 1].seconds
    const chunkLength = i - start
    const chars = lines.slice(start, i).reduce((sum, line) => sum + line.text.length, 0)
    const boundaryCue = /^(but|so|because|here'?s|the problem|the truth|if|when|instead|that means)\b/i.test(lines[i].text)

    if (gap >= 12 || chunkLength >= 8 || chars >= 700 || (chunkLength >= 4 && boundaryCue)) {
      const end = findSegmentBoundary(lines, start, i, { gapTriggered: gap >= 12 })
      chunks.push({ start, end })
      start = end + 1
      i = Math.max(start + 1, i + 1)
      continue
    }

    i += 1
  }

  if (start <= lines.length - 1) {
    chunks.push({ start, end: lines.length - 1 })
  }

  return chunks.map((chunk, index) => {
    const selected = lines.slice(chunk.start, chunk.end + 1)
    const rawText = selected.map((line) => line.text).join(' ')
    const text = trimSegmentTextToCompleteThoughts(rawText)
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

function countSharedFocusTokens(left: string, right: string) {
  const leftTokens = new Set(tokenizeForOverlap(left))
  const rightTokens = new Set(tokenizeForOverlap(right))
  let shared = 0
  for (const token of leftTokens) {
    if (rightTokens.has(token)) shared += 1
  }
  return shared
}

function briefLineFocusScore(anchor: string, candidate: string) {
  const overlap = overlapScore(anchor, candidate)
  const shared = countSharedFocusTokens(anchor, candidate)
  return overlap + Math.min(shared, 4) * 0.08
}

function sortByBriefFocus(anchor: string, candidates: string[]) {
  return [...candidates].sort(
    (left, right) => briefLineFocusScore(anchor, right) - briefLineFocusScore(anchor, left)
      || scoreEditorialLineCandidate(right) - scoreEditorialLineCandidate(left)
      || left.length - right.length,
  )
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
    .replace(/^[-–—:;,\s]+/, '')
    .replace(/\s+/g, ' ')
    .replace(/^(?:and|but|so|because|well)\b\s+/i, '')
    .replace(/^(?:really|honestly|frankly),?\s+/i, '')
    .replace(/^["'“”]+|["'“”]+$/g, '')
    .replace(/[,:;\-–—]+$/g, '')
    .trim()
}

function compactBriefCandidate(text: string, preferredMax: number = PREFERRED_BRIEF_LINE_MAX) {
  const cleaned = cleanSentence(text)
  if (!cleaned) return ''
  if (cleaned.length <= preferredMax) return cleaned

  const candidates = uniqueNormalized([
    ...splitSentences(cleaned),
    ...splitIntoClauses(cleaned),
  ])
    .map((candidate) => cleanSentence(candidate))
    .filter(Boolean)
    .filter((candidate) => candidate.length >= 28 && candidate.length <= preferredMax)
    .filter((candidate) => !isMetaNarrationLine(candidate))
    .filter((candidate) => !isFragmentaryBriefLine(candidate))
    .sort((left, right) => scoreEditorialLineCandidate(right) - scoreEditorialLineCandidate(left) || left.length - right.length)

  return candidates[0] ?? cleaned
}

function isWeakDisplayLine(text: string) {
  const cleaned = cleanSentence(text)
  if (!cleaned) return true
  if (cleaned.length < 24) return true
  if (/,$/.test(cleaned)) return true
  if (/^(for|to|and|but|or)\b/i.test(cleaned)) return true
  if (/\b(this|that|it) is (much )?more important\b/i.test(cleaned)) return true
  if (isTranscriptLeadInLine(cleaned)) return true
  if (isMetaNarrationLine(cleaned)) return true
  if (isWeakBriefLineCandidate(cleaned)) return true
  return false
}

function isWeakBriefLineCandidate(text: string) {
  const cleaned = cleanSentence(text)
  if (!cleaned) return true
  if (cleaned.length < 28) return true
  if (cleaned.length > HARD_BRIEF_LINE_MAX) return true
  if (/,$/.test(cleaned)) return true
  if (/\?$/.test(cleaned)) return true
  if (/^(i('| a)?m going to|get into|we are going to|i('| a)?ve seen|the first is|do you love|thank you very much|here('| i)?s what|right now|for \d+ years|a lot of people|if you are waiting and seeing|now|now,|starting fresh|well,?\s+(one|first)|also true of)\b/i.test(cleaned)) return true
  if (/\bby the way\b/i.test(cleaned)) return true
  if (isTranscriptLeadInLine(cleaned)) return true
  if (isMetaNarrationLine(cleaned)) return true
  if (isFragmentaryBriefLine(cleaned)) return true
  if (/^(this|that|it)\b/i.test(cleaned) && cleaned.length < 48) return true
  if (/^(there('| i)?s|here('| i)?s)\b/i.test(cleaned) && cleaned.length < 54) return true
  if (/\b(right|okay|ok|cheers)\b[.!?]*$/i.test(cleaned)) return true
  return false
}

function isFragmentaryBriefLine(text: string) {
  const cleaned = cleanSentence(text)
  if (!cleaned) return true

  const wordCount = cleaned.split(/\s+/).filter(Boolean).length
  const hasTerminalPunctuation = /[.!?]$/.test(cleaned)
  const startsConditional = /^(if|when|where|while|because|as|whether|which|that)\b/i.test(cleaned)

  if (startsConditional && !hasTerminalPunctuation) return true
  if (startsConditional && !/,/.test(cleaned) && wordCount < 14) return true
  if (/^(every|any|some|many|most)\s+\w+(?:\s+\w+){0,4}$/i.test(cleaned) && !hasTerminalPunctuation) return true
  if (/^(maintains?|maintaining|letting|using|building|triaging|calibrating)\b/i.test(cleaned) && !hasTerminalPunctuation) return true
  if (!hasTerminalPunctuation && wordCount < 7) return true
  if (!hasTerminalPunctuation && wordCount < 11 && !/\b(is|are|was|were|be|being|been|have|has|had|do|does|did|can|could|will|would|should|must|need|means|makes|keeps|goes|lets|helps|shifts|changes|replaces|solves|matters|works|fails)\b/i.test(cleaned)) return true

  return false
}

function isMetaNarrationLine(text: string) {
  const cleaned = cleanSentence(text)
  if (!cleaned) return true
  return /^(this is (a )?(video|podcast|episode) about|in this (video|podcast|episode)|the point of this (video|podcast|episode)|this is not about learning to code|that is the skill of \d{4})\b/i.test(cleaned)
    || isDemoReferenceLine(cleaned)
}

function isTranscriptLeadInLine(text: string) {
  const cleaned = cleanSentence(text)
  if (!cleaned) return true

  if (/^(so|also|and|but|well|now|today|this week)[,\s]/i.test(cleaned) && cleaned.length < 120) {
    return true
  }

  if (/^(so|also|now)[,\s].*\b(this|these|it)\s+(is|are)\b/i.test(cleaned)) {
    return true
  }

  if (/\b(one of them is called|this AI is called|these are called|flagship foundation model|optimized for|currently \w+\d|\bv\d+(?:\.\d+)?\b)\b/i.test(cleaned)) {
    return true
  }

  return false
}

function isDemoReferenceLine(text: string) {
  const cleaned = cleanSentence(text)
  if (!cleaned) return true
  return /^(here (you can|are)|if you (click|look|scroll)|if you('| a)?re interested|i('| wi)?ll link|link to this|for your reference|the description below|this main page|the full chat|here's the github repo|here are some specs|here are some additional examples|click on this demo link|interested in reading further)\b/i.test(cleaned)
    || /\b(i('| wi)?ll link to this page|description below|for your reference)\b/i.test(cleaned)
}

function trimSentence(text: string, max: number) {
  return pickDisplayLine([text], { preferredMax: max }) || cleanSentence(text)
}

function pickDisplayLine(candidates: string[], options: { preferredMax: number }) {
  const normalized = candidates
    .map((candidate) => cleanSentence(candidate))
    .filter(Boolean)

  const directFit = normalized.find((candidate) => candidate.length <= options.preferredMax)
  if (directFit) return directFit

  const clauseFits = normalized
    .flatMap((candidate) => splitIntoClauses(candidate))
    .map((candidate) => cleanSentence(candidate))
    .filter((candidate) => candidate.length >= 18 && candidate.length <= options.preferredMax)
    .filter((candidate) => !/^[a-z]/.test(candidate))
    .filter((candidate) => !/^(and|but|so|because|which|that|then)\b/i.test(candidate))

  if (clauseFits.length > 0) {
    return clauseFits.sort((a, b) => b.length - a.length)[0]
  }

  return normalized.sort((a, b) => a.length - b.length)[0]
}

function splitIntoClauses(text: string) {
  return text
    .split(/(?<=[.!?])\s+|(?<=[,;:])\s+|\s+[—–-]\s+|\s+(?=(?:because|but|while|where|when|if|so)\b)/i)
    .map((part) => normalizeClauseStart(part.trim()))
    .filter(Boolean)
}

function normalizeClauseStart(text: string) {
  const cleaned = text.trim()
  if (!cleaned) return ''
  if (!/^[a-z]/.test(cleaned)) return cleaned
  return `${cleaned[0].toUpperCase()}${cleaned.slice(1)}`
}

function extractEditorialFragments(text: string) {
  const direct = cleanSentence(text)
  const sentenceCandidates = splitSentences(text).map((line) => cleanSentence(line))
  const clauseCandidates = splitIntoClauses(text)
    .map((line) => cleanSentence(line))
    .filter((line) => !isFragmentaryBriefLine(line))
  const candidates = uniqueNormalized([
    direct,
    ...sentenceCandidates,
    ...clauseCandidates,
  ])

  return sortEditorialCandidates(candidates)
    .filter((line) => !isWeakBriefLineCandidate(line))
    .filter((line) => !isMetaNarrationLine(line))
    .filter((line) => !/^[a-z]/.test(line))
    .filter((line) => !/\b(right|okay|ok|cheers)\b[.!?]*$/i.test(line))
}

function buildBriefs(seedIdeas: Idea[], allIdeas: Idea[], sourceSlug: string, maxBriefs = 8, existingSlugs: ExistingSlugMap = {}): BriefBuildResult {
  const briefs: Brief[] = []
  const droppedBriefs: DroppedBrief[] = []
  const usedTheses = new Set<string>()
  const usedWhy = new Set<string>()
  const usedSupport = new Set<string>()
  const usedSupportLines: string[] = []
  const usedSupportingIdeaIds = new Set<string>()

  for (const idea of seedIdeas) {
    if (briefs.length >= maxBriefs) break
    const supportingIdeas = pickSupportingIdeas(idea, allIdeas, usedSupportingIdeaIds)

    const thesis = pickDistinctThesis([
      ...extractEditorialFragments(idea.text),
      idea.hook,
      idea.titleSuggestion,
      ...getCompleteThoughts(idea.text),
      extractTakeaway(idea.text, supportingIdeas),
    ], usedTheses)

    let whyItMatters = inferWhyItMatters(idea, supportingIdeas, thesis, usedWhy)
    const supportPoints = buildSupportPoints(idea, supportingIdeas, usedSupport, usedSupportLines, thesis, whyItMatters)
    if (isRedundantWhyLine(thesis, whyItMatters)) {
      whyItMatters = repairWhyItMatters(thesis, whyItMatters, supportPoints, idea, supportingIdeas, usedWhy)
    }
    if (isRedundantWhyLine(thesis, whyItMatters)) {
      const supportFallback = suggestReplacementWhy(thesis, supportPoints)
      if (supportFallback) {
        whyItMatters = supportFallback
      }
    }

    const overlapCandidates = briefs.map((existing) => ({
      briefId: existing.id,
      score: briefClaimOverlap(existing, {
        id: `brief-${idea.id}`,
        primaryIdeaId: idea.id,
        supportingIdeaIds: supportingIdeas.map((entry) => entry.id),
        thesis,
        audience: inferAudience(idea.text, supportingIdeas),
        whyItMatters,
        supportPoints,
        distinctFromBriefIds: seedIdeas.filter((entry) => entry.id !== idea.id).map((entry) => `brief-${entry.id}`),
        carouselSlug: existingSlugs[idea.id] || buildCarouselSlug(sourceSlug, idea),
      }),
    }))
    const strongestOverlap = overlapCandidates.sort((left, right) => right.score - left.score)[0]
    const focus = briefSemanticFocus({ thesis, whyItMatters, supportPoints })
    const supportIdeaDistanceFromPrimary = supportingIdeas
      .map((entry) => supportIdeaDistance(idea, entry))
      .filter((distance) => Number.isFinite(distance))

    const brief: Brief = {
      id: `brief-${idea.id}`,
      primaryIdeaId: idea.id,
      supportingIdeaIds: supportingIdeas.map((entry) => entry.id),
      thesis,
      audience: inferAudience(idea.text, supportingIdeas),
      whyItMatters,
      supportPoints,
      distinctFromBriefIds: seedIdeas.filter((entry) => entry.id !== idea.id).map((entry) => `brief-${entry.id}`),
      carouselSlug: existingSlugs[idea.id] || buildCarouselSlug(sourceSlug, idea),
      diagnostics: {
        focusScore: focus.score,
        overlapWithEarlierBriefs: strongestOverlap?.score ?? 0,
        overlapWithNearestBriefId: strongestOverlap?.briefId,
        supportIdeaDistance: supportIdeaDistanceFromPrimary,
      },
    }

    const overlapsExisting = (strongestOverlap?.score ?? 0) >= 0.48
    const isDiffuse = focus.checked && focus.score < MIN_BRIEF_FOCUS_SCORE

    if (overlapsExisting || isDiffuse) {
      const dropReasons: string[] = []
      if (overlapsExisting) {
        dropReasons.push(`overlap ${(strongestOverlap?.score ?? 0).toFixed(3)}${strongestOverlap?.briefId ? ` vs ${strongestOverlap.briefId}` : ''} exceeded distinctness threshold 0.480`)
      }
      if (isDiffuse) {
        dropReasons.push(`focus ${focus.score.toFixed(3)} fell below focus threshold ${MIN_BRIEF_FOCUS_SCORE.toFixed(3)}`)
        dropReasons.push(...describeIdeaShapeIssues(idea.text))
      }
      droppedBriefs.push({ ...brief, dropReasons })
      continue
    }

    for (const supportIdea of supportingIdeas) {
      usedSupportingIdeaIds.add(supportIdea.id)
    }

    briefs.push(brief)
  }

  return { briefs, droppedBriefs }
}

function pickSupportingIdeas(primary: Idea, allIdeas: Idea[], usedSupportingIdeaIds: Set<string>) {
  const directCandidates = allIdeas
    .filter((candidate) => candidate.id !== primary.id)
    .filter((candidate) => candidate.status === 'candidate')
    .filter((candidate) => !areNearDuplicates(candidate, primary))
    .filter((candidate) => getCompleteThoughts(candidate.text).some((line) => !isWeakBriefLineCandidate(line)))

  const nearbyFallbacks = allIdeas
    .filter((candidate) => candidate.id !== primary.id)
    .filter((candidate) => candidate.status !== 'published')
    .filter((candidate) => !areNearDuplicates(candidate, primary))
    .filter((candidate) => isNearbyIdea(primary, candidate))
    .filter((candidate) => extractEditorialFragments(candidate.text).length > 0)

  return uniqueIdeasById([...directCandidates, ...nearbyFallbacks])
    .sort((a, b) => {
      const aFresh = usedSupportingIdeaIds.has(a.id) ? 1 : 0
      const bFresh = usedSupportingIdeaIds.has(b.id) ? 1 : 0
      return aFresh - bFresh || supportIdeaDistance(primary, a) - supportIdeaDistance(primary, b) || b.score - a.score
    })
    .slice(0, 3)
}

function uniqueIdeasById(ideas: Idea[]) {
  const seen = new Set<string>()
  return ideas.filter((idea) => {
    if (seen.has(idea.id)) return false
    seen.add(idea.id)
    return true
  })
}

function supportIdeaDistance(primary: Idea, candidate: Idea) {
  const primaryOrder = numericIdeaOrder(primary)
  const candidateOrder = numericIdeaOrder(candidate)
  return Math.abs(primaryOrder - candidateOrder)
}

function isNearbyIdea(primary: Idea, candidate: Idea) {
  return supportIdeaDistance(primary, candidate) <= 2
}

function numericIdeaOrder(idea: Idea) {
  const match = idea.id.match(/segment-(\d+)/)
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY
}

async function collectRepoTitleReservations(excludeSlugs: Set<string> = new Set()) {
  const reservedTitles = new Set<string>()
  const carouselRoot = path.resolve('carousels')

  let carouselDirs: string[] = []
  try {
    carouselDirs = await readdir(carouselRoot)
  } catch {
    return reservedTitles
  }

  for (const slug of carouselDirs) {
    if (!slug || slug === '.DS_Store' || slug === 'index.json' || excludeSlugs.has(slug)) continue

    try {
      const raw = await readFile(path.join(carouselRoot, slug, 'carousel.md'), 'utf8')
      const parsed = matter(raw)
      const carouselTitle = cleanSentence(String(parsed.data?.title ?? ''))
      if (carouselTitle) reservedTitles.add(carouselTitle.toLowerCase())

      const sections = parsed.content
        .split(/^---\s*$/m)
        .map((section) => section.trim())
        .filter(Boolean)

      for (const section of sections) {
        const heading = section
          .split(/\r?\n/)
          .map((line) => line.trim())
          .find((line) => /^#{1,6}\s+/.test(line))

        const slideTitle = cleanSentence(heading?.replace(/^#{1,6}\s+/, '') ?? '')
        if (slideTitle) reservedTitles.add(slideTitle.toLowerCase())
      }
    } catch {
      continue
    }
  }

  return reservedTitles
}

async function buildCarouselBundles(
  metadata: VideoMetadata,
  sourceSlug: string,
  briefs: Brief[],
  ideas: Idea[],
  repoTitleReservations: Set<string> = new Set(),
): Promise<CarouselBundle[]> {
  const usedBatchTitles = new Set<string>(repoTitleReservations)

  return briefs.flatMap((brief) => {
    const idea = ideas.find((entry) => entry.id === brief.primaryIdeaId)
    if (!idea) return []
    const carouselSlug = brief.carouselSlug || idea.carouselSlug || buildCarouselSlug(sourceSlug, idea)
    const carousel = buildCarousel(metadata, sourceSlug, carouselSlug, brief, idea, ideas, usedBatchTitles)
    return [{
      brief: { ...brief, carouselSlug },
      idea: { ...idea, carouselSlug },
      carousel,
    }]
  })
}

function buildSummary(metadata: VideoMetadata, sourceSlug: string, carouselBundles: CarouselBundle[], ideas: Idea[], briefs: Brief[], droppedBriefs: Array<Pick<DroppedBrief, 'id' | 'primaryIdeaId' | 'thesis' | 'dropReasons' | 'diagnostics'>> = []) {
  const published = ideas.filter((idea) => idea.status === 'published')
  const candidates = ideas.filter((idea) => idea.status === 'candidate').slice(0, 5)
  const rejected = ideas.filter((idea) => idea.status === 'rejected').slice(0, 5)
  return `# Source Summary\n\n## Video\n- Title: ${metadata.title}\n- Creator: ${metadata.authorName ?? 'Unknown'}\n\n## Carousels created automatically\n- Source slug: ${sourceSlug}\n- Carousel count: ${carouselBundles.length}\n${carouselBundles
    .map(
      (bundle) => `- ${bundle.carousel.slug} → /carousel/${bundle.carousel.slug} (brief ${bundle.brief.id} from ${bundle.idea.id}, ${bundle.idea.start} → ${bundle.idea.end}, score ${bundle.idea.score})`,
    )
    .join('\n')}\n\n## Published briefs\n${briefs
    .map(
      (brief, index) => `\n### #${index + 1} — ${brief.thesis}\n- Brief: ${brief.id}\n- Primary idea: ${brief.primaryIdeaId}\n- Supporting ideas: ${brief.supportingIdeaIds.join(', ') || 'n/a'}\n- Audience: ${brief.audience}\n- Why it matters: ${brief.whyItMatters}\n- Diagnostics: focus ${(brief.diagnostics?.focusScore ?? 0).toFixed(3)} | overlap ${(brief.diagnostics?.overlapWithEarlierBriefs ?? 0).toFixed(3)}${brief.diagnostics?.overlapWithNearestBriefId ? ` vs ${brief.diagnostics.overlapWithNearestBriefId}` : ''} | support distance ${brief.diagnostics?.supportIdeaDistance.join(', ') || 'n/a'}\n- Support:\n${brief.supportPoints.map((point) => `  - ${point}`).join('\n')}\n- Distinct from: ${brief.distinctFromBriefIds.join(', ') || 'n/a'}\n`,
    )
    .join('\n')}\n\n## Brief candidates dropped after gating\n${droppedBriefs.length > 0
    ? droppedBriefs
      .slice(0, 5)
      .map(
        (brief, index) => `\n### #${index + 1} — ${brief.thesis}\n- Brief: ${brief.id}\n- Primary idea: ${brief.primaryIdeaId}\n- Drop reasons: ${brief.dropReasons.join('; ')}\n- Diagnostics: focus ${(brief.diagnostics?.focusScore ?? 0).toFixed(3)} | overlap ${(brief.diagnostics?.overlapWithEarlierBriefs ?? 0).toFixed(3)}${brief.diagnostics?.overlapWithNearestBriefId ? ` vs ${brief.diagnostics.overlapWithNearestBriefId}` : ''}\n`,
      )
      .join('\n')
    : '\nNo brief candidates were dropped after gating.\n'}\n\n## Published ideas\n${published
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

function buildSummaryFromSourceArtifacts(sourceManifest: SourceManifest, sourceSlug: string, ideas: Idea[], briefs: Brief[]) {
  const metadata = sourceManifest.video ?? { title: sourceSlug, authorName: 'Unknown' }
  const droppedBriefs = (sourceManifest.droppedBriefs ?? []).map((brief) => ({
    id: brief.id ?? 'unknown-brief',
    primaryIdeaId: brief.primaryIdeaId ?? 'unknown-idea',
    thesis: brief.thesis ?? 'Untitled dropped brief',
    dropReasons: brief.dropReasons ?? [],
    diagnostics: {
      focusScore: brief.focusScore ?? 0,
      overlapWithEarlierBriefs: brief.overlapWithEarlierBriefs ?? 0,
      overlapWithNearestBriefId: brief.overlapWithNearestBriefId,
      supportIdeaDistance: [],
    },
  }))
  const briefByPrimaryIdeaId = new Map(briefs.map((brief) => [brief.primaryIdeaId, brief]))
  const reconstructedBundles = (sourceManifest.carousels ?? [])
    .map((entry) => {
      if (!entry.slug || !entry.segmentId) return undefined
      const idea = ideas.find((candidate) => candidate.id === entry.segmentId)
      if (!idea) return undefined
      const brief = briefByPrimaryIdeaId.get(entry.segmentId) ?? briefs.find((candidate) => candidate.carouselSlug === entry.slug)
      if (!brief) return undefined
      return {
        brief: { ...brief, carouselSlug: entry.slug },
        idea: { ...idea, carouselSlug: entry.slug },
        carousel: { slug: entry.slug },
      } as CarouselBundle
    })
    .filter((bundle): bundle is CarouselBundle => Boolean(bundle))

  return buildSummary(metadata, sourceSlug, reconstructedBundles, ideas, briefs, droppedBriefs)
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
  ]).slice(0, 3)

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
    ...reserveTitlePoolForPosition(1, brief),
  )

  const slide3Title = takeTitle(
    brief.supportPoints[0] ?? '',
    primaryThoughts[2] ?? '',
    primaryThoughts[3] ?? '',
    titleFromSentence(support[4] ?? ''),
    titleFromIdea(primary, 'The real skill is recalibrating as the boundary keeps moving.'),
    ...reserveTitlePoolForPosition(2, brief),
  )

  const slide4Title = takeTitle(
    brief.supportPoints[1] ?? '',
    primaryThoughts[3] ?? '',
    primaryThoughts[4] ?? '',
    titleFromSentence(companionSegments[0]?.hook ?? ''),
    titleFromIdea(primary, 'Human attention becomes the real bottleneck.'),
    ...reserveTitlePoolForPosition(3, brief),
  )

  const closingFallbackTitle = buildClosingFallback(brief)

  const slide5Title = takeTitle(
    brief.supportPoints[2] ?? '',
    primaryThoughts[4] ?? '',
    extractTakeaway(primary.text, companionSegments),
    titleFromIdea(primary, closingFallbackTitle),
    closingFallbackTitle,
  )

  const slide4Intro = uniqueNormalized([
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
      body: buildFrameworkBody(slide4Intro, frameworkItems),
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
    .filter((line) => line.length >= 32)
    .filter((line) => !draftSlides.some((slide) => slide.title.toLowerCase() === line.toLowerCase() || slide.body.toLowerCase().includes(line.toLowerCase())))
    .slice(0, 2)
    .map((line) => ({
      title: takeTitle(line, titleFromSentence(line), 'This is where the workflow really changes.'),
      body: buildBodyLines([line, brief.whyItMatters]),
    }))

  const targetSlideCount = Math.max(4, Math.min(7, 5 + extraSlides.length))
  const middleSlides = [...draftSlides.slice(1, -1)]
  if (targetSlideCount > 5) {
    middleSlides.splice(Math.max(1, middleSlides.length - 1), 0, ...extraSlides.slice(0, targetSlideCount - 5))
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
      ...reserveTitlePoolForPosition(index, brief, totalSlides),
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
  return slides[0]?.title?.trim() || 'Untitled carousel'
}

function buildBodyLines(lines: string[]) {
  return uniqueNormalized(lines)
    .filter((line) => !/[.…]$/.test(line) || /[.!?]$/.test(line))
    .slice(0, 2)
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
  return reserveTitleForPosition(index, brief, totalSlides)
}

function reserveTitlePoolForPosition(index: number, brief: Brief, totalSlides = 5) {
  if (index === 0) {
    return buildDisplayTitlePool([
      brief.thesis,
      compactDisplayCandidate(brief.thesis),
      'AI workflows are shifting faster than most teams realize.',
    ])
  }

  if (index === 1) {
    return buildDisplayTitlePool([
      brief.whyItMatters,
      compactDisplayCandidate(brief.whyItMatters),
      compactDisplayCandidate(brief.thesis),
      'Stale mental models break the workflow before the model does.',
      'If the mental model is wrong, the workflow redesign is wrong too.',
    ])
  }

  if (index === totalSlides - 1) {
    return buildClosingFallbackPool(brief)
  }

  const positionPool = index === 2
    ? [
        brief.supportPoints[0] ?? '',
        brief.supportPoints[1] ?? '',
        'The hard part becomes attention triage under load.',
        'The constraint is review depth, not agent volume.',
        'A faster model is useless if nobody can review the right output in time.',
        'The skill shifts from doing every task to routing human attention well.',
        'The workflow breaks when review depth lags behind model speed.',
        'Better models raise the cost of lazy oversight, not the need for it.',
      ]
    : [
        brief.supportPoints[1] ?? '',
        brief.supportPoints[0] ?? '',
        'Human review becomes a routing decision, not a blanket step.',
        'Operators need sharper review boundaries as the workflow speeds up.',
        'The operating model has to change before the team scales the mistake.',
        'High-leverage teams define escalation paths before they automate the flow.',
        'You cannot automate safely without deciding who reviews what and when.',
        'The team needs explicit escalation paths before the workload spikes.',
      ]

  const middleReservePool = buildDisplayTitlePool(positionPool.flatMap((line) => [line, compactDisplayCandidate(line)]))
  if (middleReservePool.length === 0) {
    return [index === totalSlides - 2
      ? 'The operating model has to change before the team scales the mistake.'
      : 'The hard part becomes attention triage under load.']
  }

  const hash = brief.id.split('').reduce((total, char) => total + char.charCodeAt(0), index * 17)
  const pivot = hash % middleReservePool.length
  return middleReservePool.slice(pivot).concat(middleReservePool.slice(0, pivot))
}

function reserveTitleForPosition(index: number, brief: Brief, totalSlides = 5) {
  return reserveTitlePoolForPosition(index, brief, totalSlides)[0]
    ?? (index === totalSlides - 1
      ? 'Winning teams build clearer review loops.'
      : index === totalSlides - 2
        ? 'The operating model has to change before the team scales the mistake.'
        : 'The hard part becomes attention triage under load.')
}

function buildClosingFallbackPool(brief: Brief) {
  const base = uniqueNormalized([
    brief.supportPoints[2] ?? '',
    brief.supportPoints[1] ?? '',
    brief.whyItMatters,
    brief.thesis,
  ]).filter((line) => !isWeakDisplayLine(line))

  const preferred = pickDisplayLine(base, { preferredMax: 84 })
  const reserveTitles = uniqueNormalized([
    closingReserveTitle(brief),
    'Winning teams turn review into an explicit operating rhythm.',
    'Strong operators design fallback rules before the failure shows up.',
    'The advantage is faster supervision, not blind automation.',
  ]).filter((line) => !isWeakDisplayLine(line))

  return uniqueNormalized([
    preferred ?? '',
    ...base,
    ...reserveTitles,
  ]).filter((line) => !isWeakDisplayLine(line))
}

function buildClosingFallback(brief: Brief) {
  return buildClosingFallbackPool(brief)[0] ?? closingReserveTitle(brief)
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
  const normalizedCandidates = uniqueNormalized(candidates
    .map((candidate) => cleanSentence(candidate))
    .filter(Boolean))

  for (const candidate of normalizedCandidates) {
    const key = candidate.toLowerCase()
    if (isWeakDisplayLine(candidate) || usedTitles.has(key) || reservedTitles.has(key)) continue
    usedTitles.add(key)
    reservedTitles.add(key)
    return candidate
  }

  const fallback = normalizedCandidates.find((candidate) => !isWeakDisplayLine(candidate) && !usedTitles.has(candidate.toLowerCase()) && !reservedTitles.has(candidate.toLowerCase()))
    || normalizedCandidates.find((candidate) => candidate.toLowerCase() !== 'untitled slide' && !usedTitles.has(candidate.toLowerCase()) && !reservedTitles.has(candidate.toLowerCase()))
    || nextGenericUniqueTitle(usedTitles, reservedTitles)
  const fallbackKey = fallback.toLowerCase()
  usedTitles.add(fallbackKey)
  reservedTitles.add(fallbackKey)
  return fallback
}

function nextGenericUniqueTitle(usedTitles: Set<string>, reservedTitles: Set<string>) {
  for (const title of GENERIC_UNIQUE_TITLE_POOL) {
    const key = title.toLowerCase()
    if (usedTitles.has(key) || reservedTitles.has(key)) continue
    return title
  }

  for (const lead of GENERIC_UNIQUE_TITLE_LEADS) {
    for (const tail of GENERIC_UNIQUE_TITLE_TAILS) {
      const title = `${lead} ${tail}`
      const key = title.toLowerCase()
      if (usedTitles.has(key) || reservedTitles.has(key)) continue
      return title
    }
  }

  for (const base of FINAL_RESERVE_TITLE_BASES) {
    const key = base.toLowerCase()
    if (!usedTitles.has(key) && !reservedTitles.has(key)) {
      return base
    }
  }

  for (const base of FINAL_RESERVE_TITLE_BASES) {
    for (let attempt = 2; attempt <= 99; attempt += 1) {
      const title = `${base.replace(/[.!?]+$/, '')} (${attempt}).`
      const key = title.toLowerCase()
      if (usedTitles.has(key) || reservedTitles.has(key)) continue
      return title
    }
  }

  return `Workflow review checkpoint (${usedTitles.size + reservedTitles.size + 1}).`
}

function chooseOpeningTitle(candidates: string[]) {
  const normalizedCandidates = candidates
    .flatMap((candidate) => [cleanSentence(candidate), compactDisplayCandidate(candidate)])
    .filter(Boolean)

  const strong = normalizedCandidates.find((candidate) => !isWeakDisplayLine(candidate) && candidate.length <= 84)
  if (strong) return strong

  const picked = pickDisplayLine(normalizedCandidates, { preferredMax: 84 })
  if (picked && !isWeakDisplayLine(picked)) return picked

  const fallback = normalizedCandidates.find((candidate) => candidate.length >= 28)
  return fallback || 'AI operating models are getting stale faster than most teams realize.'
}

function compactDisplayCandidate(text: string) {
  const cleaned = cleanSentence(text)
  if (!cleaned) return ''
  if (!isWeakDisplayLine(cleaned)) return cleaned

  const conditionalTail = cleaned.match(/^(?:if|when|where|while|because|as|whether|which|that)\b[^,]*,\s*(.+)$/i)?.[1] ?? ''
  const colonTail = cleaned.includes(':') ? cleaned.split(':').slice(1).join(':') : ''
  const clauseCandidates = splitIntoClauses(cleaned).map((part) => cleanSentence(part))
  const sentenceCandidates = splitSentences(cleaned).map((part) => cleanSentence(part))

  const candidates = uniqueNormalized([
    conditionalTail,
    colonTail,
    ...sentenceCandidates,
    ...clauseCandidates,
  ]).filter(Boolean)

  return candidates
    .filter((candidate) => !isWeakDisplayLine(candidate))
    .sort((left, right) => scoreEditorialLineCandidate(right) - scoreEditorialLineCandidate(left) || right.length - left.length)[0] ?? ''
}

function buildDisplayTitlePool(candidates: string[]) {
  return uniqueNormalized(candidates)
    .flatMap((candidate) => [candidate, compactDisplayCandidate(candidate)])
    .filter(Boolean)
    .filter((line) => !isWeakDisplayLine(line))
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
    .map((part) => cleanSentence(part))
    .filter(Boolean)
    .filter((part) => !isWeakDisplayLine(part))
    .sort((a, b) => b.length - a.length)

  return clauses[0] ?? cleaned
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

function scoreEditorialLineCandidate(value: string) {
  const line = cleanSentence(value)
  if (!line) return -100

  let score = 0

  if (line.length >= 42 && line.length <= 110) score += 4
  else if (line.length >= 32) score += 2
  else score -= 3

  if (/^(thank you very much|thanks(?:\s+everyone|\s+for watching)?|i\'?m describing|i know that|i think one of the lessons|i\'?ll be honest|this is where|there are many|we are going to|you may be at a point where)\b/i.test(line)) {
    score -= 8
  }

  if (/^(i|we|this|that|it|there)\b/i.test(line)) score -= 2
  if (/\b(ai|agent|workflow|operators?|team|company|customer|product|execution|coordination|context|boundary|calibration|value|cost|math|model|review|practice|manager)\b/i.test(line)) score += 4
  if (/\b(not|because|instead|without|but|real|better|worse|brutal|temporary|shift|replace|replaceable)\b/i.test(line)) score += 2
  if (/\d/.test(line)) score += 1
  if (/[.:;]$/.test(line)) score -= 1

  return score
}

function sortEditorialCandidates(candidates: string[]) {
  return candidates
    .map((candidate, index) => ({ candidate: compactBriefCandidate(candidate), index }))
    .filter((entry) => Boolean(entry.candidate))
    .sort((left, right) => scoreEditorialLineCandidate(right.candidate) - scoreEditorialLineCandidate(left.candidate) || left.index - right.index)
    .map((entry) => entry.candidate)
}

function pickDistinctThesis(candidates: string[], usedTheses: Set<string>) {
  const normalized = sortEditorialCandidates(candidates)
  for (const candidate of normalized) {
    const key = slugify(candidate)
    if (!isWeakDisplayLine(candidate) && !isWeakBriefLineCandidate(candidate) && !usedTheses.has(key)) {
      usedTheses.add(key)
      return candidate
    }
  }

  const fallback = normalized.find((candidate) => !isWeakBriefLineCandidate(candidate))
    ?? normalized[0]
    ?? 'A stronger operating model beats a stale workflow.'
  usedTheses.add(slugify(fallback))
  return fallback
}

function briefClaimOverlap(left: Brief, right: Brief) {
  const leftClaim = [left.thesis, left.whyItMatters, ...left.supportPoints].join(' ')
  const rightClaim = [right.thesis, right.whyItMatters, ...right.supportPoints].join(' ')
  return overlapScore(leftClaim, rightClaim)
}

function briefSemanticFocus(brief: Pick<Brief, 'thesis' | 'whyItMatters' | 'supportPoints'>) {
  const supportLines = brief.supportPoints.filter(Boolean)
  const anchor = [brief.thesis, brief.whyItMatters].filter(Boolean).join(' ')
  if (!anchor || supportLines.length === 0) {
    return { checked: false, score: 0 }
  }

  const supportScores = supportLines.map((line) => overlapScore(brief.thesis, line) + Math.min(countSharedFocusTokens(brief.thesis, line), 4) * 0.08)
  const whyScore = brief.whyItMatters
    ? overlapScore(brief.thesis, brief.whyItMatters) + Math.min(countSharedFocusTokens(brief.thesis, brief.whyItMatters), 4) * 0.06
    : 0
  const averageSupport = supportScores.reduce((sum, score) => sum + score, 0) / supportScores.length
  const anchorScore = overlapScore(anchor, supportLines.join(' '))

  return {
    checked: true,
    score: averageSupport * 0.7 + anchorScore * 0.2 + whyScore * 0.1,
  }
}

function inferAudience(primary: string, support: Idea[]) {
  const combined = `${primary} ${support.map((idea) => idea.text).join(' ')}`.toLowerCase()
  if (/organization|team|manager|operator|workflow|domain/.test(combined)) return 'Audience: operators, team leads, and founders redesigning AI-assisted workflows.'
  if (/product manager|designer|engineer/.test(combined)) return 'Audience: product, design, and engineering leaders figuring out where AI changes the work.'
  return 'Audience: people using AI in real work, not just talking about it.'
}

function inferWhyItMatters(primary: Idea, support: Idea[], thesis: string, usedWhy: Set<string>) {
  const thesisKey = slugify(thesis)
  const candidates = sortWhyCandidates(thesis, sortEditorialCandidates(uniqueNormalized([
    ...extractEditorialFragments(primary.text),
    ...support.flatMap((idea) => extractEditorialFragments(idea.text)),
    ...getCompleteThoughts(primary.text),
    ...support.flatMap((idea) => getCompleteThoughts(idea.text)),
    extractTakeaway(primary.text, support),
    'If your mental model is stale, you redesign the wrong part of the workflow.',
  ])))

  for (const candidate of candidates) {
    const key = slugify(candidate)
    if (key === thesisKey) continue
    if (usedWhy.has(key)) continue
    if (isWeakDisplayLine(candidate) || isWeakBriefLineCandidate(candidate)) continue
    if (isRedundantWhyLine(thesis, candidate)) continue
    usedWhy.add(key)
    return candidate
  }

  const fallback = 'If your mental model is stale, you redesign the wrong part of the workflow.'
  usedWhy.add(slugify(fallback))
  return fallback
}

function isRedundantWhyLine(thesis: string, whyItMatters: string) {
  const thesisNormalized = normalizeRedundantWhyLine(thesis)
  const whyNormalized = normalizeRedundantWhyLine(whyItMatters)
  if (!thesisNormalized || !whyNormalized) return false
  if (thesisNormalized === whyNormalized) return true
  if (thesisNormalized.includes(whyNormalized) || whyNormalized.includes(thesisNormalized)) return true
  return overlapScore(thesisNormalized, whyNormalized) >= 0.9
}

function normalizeRedundantWhyLine(value: string) {
  return normalizeForSlide(value).toLowerCase()
}

function sortWhyCandidates(thesis: string, candidates: string[]) {
  return [...candidates].sort(
    (left, right) => scoreWhyCandidate(thesis, right) - scoreWhyCandidate(thesis, left)
      || scoreEditorialLineCandidate(right) - scoreEditorialLineCandidate(left)
      || right.length - left.length,
  )
}

function suggestReplacementWhy(thesis: string, supportPoints: string[]) {
  return [...supportPoints]
    .filter(Boolean)
    .filter((line) => !isWeakBriefLineCandidate(line))
    .filter((line) => !isRedundantWhyLine(thesis, line))
    .sort((left, right) => scoreWhyCandidate(thesis, right) - scoreWhyCandidate(thesis, left) || right.length - left.length)[0]
}

function scoreWhyCandidate(thesis: string, candidate: string) {
  const line = normalizeForSlide(candidate)
  if (!line) return Number.NEGATIVE_INFINITY
  if (isRedundantWhyLine(thesis, line)) return -100

  let score = briefLineFocusScore(thesis, line)

  if (/\b(because|so|which means|that means|this means|therefore|instead|forces?|turns?|makes?|lets?|allows?|deletes?|removes?|changes?|shifts?|breaks?|collapses?|evaporates?|disappear|matters?)\b/i.test(line)) {
    score += 0.35
  }

  if (/\b(cost|overhead|handoff|handoffs|coordination|math|org|organization|review|workflow|execution|value|calendar|meetings?|structure|layer)\b/i.test(line)) {
    score += 0.18
  }

  if (/\b(if you are|the [a-z\- ]+ is the value)\b/i.test(line)) {
    score -= 0.2
  }

  return score
}

function repairWhyItMatters(
  thesis: string,
  currentWhy: string,
  supportPoints: string[],
  primary: Idea,
  support: Idea[],
  usedWhy: Set<string>,
) {
  const currentKey = slugify(currentWhy)

  const directSupportReplacement = suggestReplacementWhy(thesis, supportPoints)

  if (directSupportReplacement && slugify(directSupportReplacement) !== currentKey && !usedWhy.has(slugify(directSupportReplacement))) {
    usedWhy.add(slugify(directSupportReplacement))
    return directSupportReplacement
  }

  const candidates = sortWhyCandidates(thesis, sortEditorialCandidates(uniqueNormalized([
    ...supportPoints,
    ...support.flatMap((idea) => extractEditorialFragments(idea.text)),
    ...support.flatMap((idea) => getCompleteThoughts(idea.text)),
    ...extractEditorialFragments(primary.text),
    ...getCompleteThoughts(primary.text),
    extractTakeaway(primary.text, support),
    'If your mental model is stale, you redesign the wrong part of the workflow.',
  ])))

  for (const candidate of candidates) {
    const key = slugify(candidate)
    if (!candidate || key === currentKey) continue
    if (usedWhy.has(key)) continue
    if (isWeakDisplayLine(candidate) || isWeakBriefLineCandidate(candidate)) continue
    if (isRedundantWhyLine(thesis, candidate)) continue
    usedWhy.add(key)
    return candidate
  }

  const fallback = 'If your mental model is stale, you redesign the wrong part of the workflow.'
  if (!isRedundantWhyLine(thesis, fallback)) {
    usedWhy.add(slugify(fallback))
    return fallback
  }

  return currentWhy
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
  const points = sortByBriefFocus(thesis, sortEditorialCandidates(uniqueNormalized([
    ...extractEditorialFragments(primary.text).slice(1),
    ...support.flatMap((idea) => extractEditorialFragments(idea.text).slice(0, 3)),
    ...getCompleteThoughts(primary.text).slice(1),
    ...support.flatMap((idea) => getCompleteThoughts(idea.text).slice(0, 2)),
    titleFromSentence(primary.titleSuggestion),
    titleFromSentence(primary.hook),
    extractTakeaway(primary.text, support),
  ])))
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

  const backfillPoints = sortByBriefFocus(thesis, uniqueNormalized([
    ...splitIntoClauses(primary.text),
    ...splitIntoClauses(primary.hook),
    ...splitIntoClauses(primary.titleSuggestion),
    ...support.flatMap((idea) => splitIntoClauses(idea.text).slice(0, 2)),
  ]))
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
  return extractEditorialFragments(value)[0] ?? ''
}

function isWeakSupportBackfill(value: string) {
  const line = normalizeForSlide(value)
  if (!line) return true
  if (line.length < 32) return true
  if (/\?$/.test(line)) return true
  if (/^(for|to|and|but|or|so|because)\b/i.test(line)) return true
  if (isFragmentaryBriefLine(line)) return true
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

  await removeDerivedArtifactsForSlugs(staleSlugs, { includeMarkdown: true })
}

async function invalidateDerivedArtifactsForBundles(bundles: CarouselBundle[]) {
  const slugs = bundles.map((bundle) => bundle.carousel.slug)
  await removeDerivedArtifactsForSlugs(slugs)
}

async function removeDerivedArtifactsForSlugs(slugs: string[], options: { includeMarkdown?: boolean } = {}) {
  const uniqueSlugs = [...new Set(slugs.filter(Boolean))]

  await Promise.all(uniqueSlugs.map(async (slug) => {
    if (options.includeMarkdown) {
      await rm(path.resolve('carousels', slug), { recursive: true, force: true })
    }
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

const GENERIC_UNIQUE_TITLE_POOL = [
  'The workflow review boundary has to be explicit.',
  'A better model does not remove the need for supervision.',
  'Teams need escalation paths before the throughput jumps.',
  'The operator advantage is clearer review discipline.',
  'Automation fails fast when nobody owns the checkpoint.',
  'The real bottleneck is deciding what deserves human eyes.',
  'Review discipline becomes the operating advantage.',
  'Fast output is useless without owned checkpoints.',
  'The workflow needs stronger supervision habits.',
  'Escalation rules matter more as throughput rises.',
  'Better routing beats blanket review.',
  'Clear fallback rules prevent expensive automation drift.',
]

const GENERIC_UNIQUE_TITLE_LEADS = [
  'The workflow needs',
  'Operators need',
  'The team needs',
  'Strong systems need',
  'High-output teams need',
  'Reliable automation needs',
]

const GENERIC_UNIQUE_TITLE_TAILS = [
  'clearer review checkpoints.',
  'sharper escalation rules.',
  'more disciplined supervision habits.',
  'tighter fallback boundaries.',
  'explicit human decision gates.',
  'better audit rhythms.',
  'a named owner for the checkpoint.',
  'a stronger handoff rule.',
]

const FINAL_RESERVE_TITLE_BASES = [
  'The workflow still needs a clearer human checkpoint.',
  'Reliable automation still needs a named reviewer.',
  'The system still needs an explicit escalation rule.',
  'Human review still needs a tighter ownership line.',
]

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'youtube-source'
}
