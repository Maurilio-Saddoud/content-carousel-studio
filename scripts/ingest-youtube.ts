import { execFile } from 'node:child_process'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { promisify } from 'node:util'
import path from 'node:path'
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

type CarouselBundle = {
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
  publishedIdeaIds?: string[]
  selectedSegmentIds?: string[]
  carousels?: Array<{ segmentId?: string; slug?: string; title?: string; previewPath?: string; carouselPath?: string }>
  createdFiles?: string[]
}

const TRANSCRIPT_TOOL_PATH = path.resolve('../youtube-transcript-v1/yt_transcript.py')
const RAW_TRANSCRIPT_RE = /^\[(\d{2}):(\d{2}):(\d{2})\]\s+(.*)$/
const execFileAsync = promisify(execFile)
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

  const carouselBundles = buildCarouselBundles(metadata, sourceSlug, publishedIdeas)
  await removeStalePublishedArtifacts(previousManifest?.carousels ?? [], carouselBundles)

  for (const bundle of carouselBundles) {
    await mkdir(path.resolve('carousels', bundle.carousel.slug), { recursive: true })
    await writeFile(path.resolve('carousels', bundle.carousel.slug, 'carousel.md'), renderCarouselMarkdown(bundle.carousel), 'utf8')
  }
  await syncCarouselDirectoryIndex()

  const summary = buildSummary(metadata, sourceSlug, carouselBundles, ideas)

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
    ideaCount: ideas.length,
    publishedIdeaIds: publishedIdeas.map((idea) => idea.id),
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
      `sources/${sourceSlug}/summary.md`,
      ...carouselBundles.map((bundle) => `carousels/${bundle.carousel.slug}/carousel.md`),
      'carousels/index.json',
    ],
  }

  await writeFile(path.join(sourceDir, 'source.json'), `${JSON.stringify(sourceManifest, null, 2)}\n`, 'utf8')
  await writeFile(path.join(sourceDir, 'raw-transcript.md'), renderRawTranscript(metadata, args.url, transcript), 'utf8')
  await writeFile(path.join(sourceDir, 'clean-transcript.md'), renderCleanTranscript(metadata, cleanTranscript), 'utf8')
  await writeFile(path.join(sourceDir, 'segments.json'), `${JSON.stringify(rankedSegments, null, 2)}\n`, 'utf8')
  await writeFile(path.join(sourceDir, 'ideas.json'), `${JSON.stringify(ideas, null, 2)}\n`, 'utf8')
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
  const ideas = buildIdeas(segments, sourceSlug, publishLimit, existingSlugs)
  const publishedIdeas = ideas.filter((idea) => idea.status === 'published')
  const carouselBundles = buildCarouselBundles(metadata, sourceSlug, publishedIdeas)
  await removeStalePublishedArtifacts(sourceManifest.carousels ?? [], carouselBundles)
  await writeFile(path.join(sourceDir, 'segments.json'), `${JSON.stringify(segments, null, 2)}\n`, 'utf8')
  await writeFile(path.join(sourceDir, 'ideas.json'), `${JSON.stringify(ideas, null, 2)}\n`, 'utf8')

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
    defaultBehavior: 'creates source artifacts, ranks candidate ideas, and publishes markdown carousels only for selected ideas',
    ideaCount: ideas.length,
    publishedIdeaIds: publishedIdeas.map((idea) => idea.id),
    ideaRule: {
      publishLimit,
      threshold: 'Ideas must pass the editorial filter (score >= 4, 28-155 words, at least 2 full sentences, no obvious intro/outro junk, no near-duplicates).',
    },
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
      `sources/${sourceSlug}/summary.md`,
      ...carouselBundles.map((bundle) => `carousels/${bundle.carousel.slug}/carousel.md`),
      'carousels/index.json',
    ],
  }, null, 2)}\n`, 'utf8')
  await writeFile(path.join(sourceDir, 'summary.md'), buildSummary(metadata, sourceSlug, carouselBundles, ideas), 'utf8')

  console.log(`Rebuilt ${carouselBundles.length} carousel${carouselBundles.length === 1 ? '' : 's'} for ${sourceSlug}`)
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
  const args: { sourceSlug?: string; maxSegments: number } = {
    maxSegments: 8,
  }

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
  const fullSentenceCount = splitSentences(text).filter((sentence) => sentence.split(/\s+/).filter(Boolean).length >= 5).length

  if (segment.score < 4) reasons.push('Score is too weak for publication.')
  if (segment.wordCount < 28 || segment.wordCount > 155) reasons.push('Transcript chunk length is outside the publishable range.')
  if (fullSentenceCount < 2) reasons.push('Needs at least two complete sentences.')
  if (/^(and|but|so|because|which|that|then)\b/i.test(text)) reasons.push('Starts mid-thought instead of opening cleanly.')
  if (/^[a-z]/.test(text)) reasons.push('Starts with lowercase text, which usually indicates a fragment.')
  if (/\b(thanks for watching|subscribe|welcome back|link in the description)\b/i.test(text)) reasons.push('Contains intro/outro filler.')

  return reasons
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
  return text.replace(/^[-–—:;,\s]+/, '').replace(/\s+/g, ' ').trim()
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
    .split(/(?<=[,;:])\s+|\s+[—–-]\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function buildCarouselBundles(metadata: VideoMetadata, sourceSlug: string, ideas: Idea[]): CarouselBundle[] {
  return ideas.map((idea) => {
    const carouselSlug = idea.carouselSlug || buildCarouselSlug(sourceSlug, idea)
    const carousel = buildCarousel(metadata, sourceSlug, carouselSlug, idea, ideas)
    return {
      idea: { ...idea, carouselSlug },
      carousel,
    }
  })
}

function buildSummary(metadata: VideoMetadata, sourceSlug: string, carouselBundles: CarouselBundle[], ideas: Idea[]) {
  const published = ideas.filter((idea) => idea.status === 'published')
  const candidates = ideas.filter((idea) => idea.status === 'candidate').slice(0, 5)
  const rejected = ideas.filter((idea) => idea.status === 'rejected').slice(0, 5)
  return `# Source Summary\n\n## Video\n- Title: ${metadata.title}\n- Creator: ${metadata.authorName ?? 'Unknown'}\n\n## Carousels created automatically\n- Source slug: ${sourceSlug}\n- Carousel count: ${carouselBundles.length}\n${carouselBundles
    .map(
      (bundle) => `- ${bundle.carousel.slug} → /carousel/${bundle.carousel.slug} (from ${bundle.idea.id}, ${bundle.idea.start} → ${bundle.idea.end}, score ${bundle.idea.score})`,
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
    : '\nNo top-ranked ideas were rejected.\n'}\n## Editorial note\nPublished ideas are the only ones materialized as markdown carousels. The source package keeps the broader ideas list so re-ingest can reselect without polluting the site or export indexes.\n`
}

function buildCarousel(metadata: VideoMetadata, sourceSlug: string, carouselSlug: string, primary: Idea, ideas: Idea[]): Carousel {
  const companionSegments = ideas.filter((idea) => idea.id !== primary.id)
  const primaryThoughts = getCompleteThoughts(primary.text)
  const companionThoughts = companionSegments.flatMap((segment) => getCompleteThoughts(segment.text))
  const support = uniqueNormalized([...primaryThoughts.slice(1), ...companionThoughts]).filter((sentence) => sentence.length >= 24)

  const opening = pickDisplayLine([
    primaryThoughts[0] ?? '',
    primary.hook,
    primary.titleSuggestion,
    'AI operating models are getting stale faster than most teams realize.',
  ], { preferredMax: 84 }) ?? 'AI operating models are getting stale faster than most teams realize.'

  const frameworkItems = uniqueNormalized([
    support[5] ?? 'Update your mental model before you update the workflow.',
    support[8] ?? 'Decide what deserves human review and what can safely flow through.',
    extractTakeaway(primary.text, companionSegments),
  ]).slice(0, 3)

  const slides: CarouselSlide[] = [
    {
      id: '01',
      title: opening,
      body: '',
    },
    {
      id: '02',
      title: pickDisplayLine([
        primaryThoughts[1] ?? '',
        support[0] ?? '',
        'This matters because stale mental models break fast.',
      ], { preferredMax: 84 }) ?? 'This matters because stale mental models break fast.',
      body: buildBodyLines([
        support[2] ?? 'Most people are still acting on an old picture of what AI can and cannot do.',
        support[3] ?? 'That creates wasted effort, bad delegation, and skepticism aimed at the wrong failure modes.',
      ]),
    },
    {
      id: '03',
      title: pickDisplayLine([
        companionSegments[0]?.hook ?? '',
        support[4] ?? '',
        'The skill is maintaining calibration as the boundary keeps moving.',
      ], { preferredMax: 84 }) ?? 'The skill is maintaining calibration as the boundary keeps moving.',
      body: buildQuoteBody([
        support[5] ?? 'What worked as a rule of thumb a few months ago can already be wrong now.',
        support[6] ?? 'Operators need current failure models, not generic vibes.',
      ]),
    },
    {
      id: '04',
      title: pickDisplayLine([
        companionSegments[1]?.hook ?? '',
        support[7] ?? '',
        'Human attention becomes the real bottleneck.',
      ], { preferredMax: 84 }) ?? 'Human attention becomes the real bottleneck.',
      body: buildFrameworkBody(
        support[7] ?? 'The workflow needs clearer review boundaries.',
        frameworkItems,
      ),
    },
    {
      id: '05',
      title: pickDisplayLine([
        extractTakeaway(primary.text, companionSegments),
        'The edge is keeping your operating model current.',
      ], { preferredMax: 84 }) ?? 'The edge is keeping your operating model current.',
      body: buildBodyLines([
        'Use the source package as evidence, not as final copy.',
        'Then sharpen the thesis until it actually sounds like Maurilio, not a transcript.',
      ]),
    },
  ]

  return {
    slug: carouselSlug,
    title: titleBaseFromSlides(slides),
    description: `${metadata.authorName ?? 'YouTube'} on ${sourceSlug}: ${primary.start} → ${primary.end}.`,
    sourceType: 'transcript',
    aspectRatio: 'portrait',
    updatedAt: new Date().toISOString().slice(0, 10),
    theme: DEFAULT_THEME,
    slides,
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
    .replace(/\b(and|but|so|because)\b\s+/i, '')
    .replace(/\b(?:you know|sort of|kind of)\b/gi, '')
    .replace(/\s+([,.!?;:])/g, '$1')
    .trim()
}

function extractTakeaway(primaryText: string, segments: Segment[]) {
  const candidate = [
    ...splitSentences(primaryText),
    ...segments.map((segment) => segment.hook),
    'The edge is not knowing one workflow. It is keeping your operating model current.',
  ].find((sentence) => /\b(skill|attention|boundary|calibration|system|workflow|operators?)\b/i.test(sentence))

  return candidate ?? 'The edge is keeping your operating model current.'
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
