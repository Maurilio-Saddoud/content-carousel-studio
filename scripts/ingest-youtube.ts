import { execFile } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { promisify } from 'node:util'
import path from 'node:path'

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

type DraftCarouselBundle = {
  segment: Segment
  carousel: Carousel
  briefMarkdown: string
}

type ExistingSlugMap = Record<string, string>

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
  const draftDir = path.resolve('drafts', sourceSlug)

  await mkdir(sourceDir, { recursive: true })
  await mkdir(draftDir, { recursive: true })

  const { transcript, transcriptMode } = await fetchTranscript(args.url, args.whisperModel)
  const transcriptLines = parseTranscript(transcript)

  if (transcriptLines.length === 0) {
    throw new Error('Transcript fetch succeeded but returned zero timestamped lines.')
  }

  const cleanTranscript = buildCleanTranscript(transcriptLines)
  const rankedSegments = rankSegments(segmentTranscript(transcriptLines))
  const segments = selectEditorialSegments(rankedSegments, args.maxSegments)

  if (segments.length === 0) {
    throw new Error('Could not find any usable transcript segments after editorial filtering.')
  }

  const draftBundles = buildDraftCarouselBundles(metadata, sourceSlug, segments)

  for (const bundle of draftBundles) {
    await mkdir(path.resolve('carousels', bundle.carousel.slug), { recursive: true })
    await mkdir(path.resolve('drafts', sourceSlug, bundle.carousel.slug), { recursive: true })
    await upsertCarouselDirectoryItem(bundle.carousel)
    await writeFile(path.resolve('carousels', bundle.carousel.slug, 'carousel.md'), renderCarouselMarkdown(bundle.carousel), 'utf8')
    await writeFile(path.resolve('drafts', sourceSlug, bundle.carousel.slug, 'post-brief.md'), bundle.briefMarkdown, 'utf8')
  }

  const summary = buildSummary(metadata, sourceSlug, draftBundles, segments)

  const sourceManifest = {
    slug: sourceSlug,
    sourceType: 'transcript',
    sourceUrl: args.url,
    fetchedAt: new Date().toISOString(),
    transcriptMode,
    whisperModel: args.whisperModel,
    video: metadata,
    transcriptLineCount: transcriptLines.length,
    defaultBehavior: 'creates source artifacts and one markdown-first draft carousel per qualifying editorial segment',
    draftCarouselRule: {
      maxDrafts: args.maxSegments,
      threshold: `Each draft comes from a selected editorial segment. Selected segments must pass the editorial filter (score >= 4, 28-155 words, at least 2 full sentences, no obvious intro/outro junk, no near-duplicates).`,
    },
    selectedSegmentIds: segments.map((segment) => segment.id),
    draftCarousels: draftBundles.map((bundle) => ({
      slug: bundle.carousel.slug,
      segmentId: bundle.segment.id,
      title: bundle.carousel.title,
      previewPath: `/carousel/${bundle.carousel.slug}`,
      briefPath: `drafts/${sourceSlug}/${bundle.carousel.slug}/post-brief.md`,
      carouselPath: `carousels/${bundle.carousel.slug}/carousel.md`,
    })),
    createdFiles: [
      `sources/${sourceSlug}/source.json`,
      `sources/${sourceSlug}/raw-transcript.md`,
      `sources/${sourceSlug}/clean-transcript.md`,
      `sources/${sourceSlug}/segments.json`,
      `sources/${sourceSlug}/summary.md`,
      ...draftBundles.flatMap((bundle) => [
        `drafts/${sourceSlug}/${bundle.carousel.slug}/post-brief.md`,
        `carousels/${bundle.carousel.slug}/carousel.md`,
      ]),
      'carousels/index.json',
    ],
  }

  await writeFile(path.join(sourceDir, 'source.json'), `${JSON.stringify(sourceManifest, null, 2)}\n`, 'utf8')
  await writeFile(path.join(sourceDir, 'raw-transcript.md'), renderRawTranscript(metadata, args.url, transcript), 'utf8')
  await writeFile(path.join(sourceDir, 'clean-transcript.md'), renderCleanTranscript(metadata, cleanTranscript), 'utf8')
  await writeFile(path.join(sourceDir, 'segments.json'), `${JSON.stringify(segments, null, 2)}\n`, 'utf8')
  await writeFile(path.join(sourceDir, 'summary.md'), summary, 'utf8')

  console.log(`Created transcript package and ${draftBundles.length} draft carousel${draftBundles.length === 1 ? '' : 's'} for ${sourceSlug}`)
  for (const file of sourceManifest.createdFiles) {
    console.log(`- ${file}`)
  }

  await autoCommitAndPushGeneratedChanges(sourceSlug, draftBundles)
}

export async function rebuildDraftsFromSourceArgv(argv: string[] = process.argv.slice(2)) {
  const sourceSlug = argv[0]
  if (!sourceSlug) {
    throw new Error('Usage: content-carousel rebuild-source <source-slug>')
  }

  const sourceDir = path.resolve('sources', sourceSlug)
  const sourceManifestRaw = await readFile(path.join(sourceDir, 'source.json'), 'utf8')
  const sourceManifest = JSON.parse(sourceManifestRaw) as {
    video?: VideoMetadata
    draftCarousels?: Array<{ segmentId?: string; slug?: string }>
  }
  const segmentsRaw = await readFile(path.join(sourceDir, 'segments.json'), 'utf8')
  const segments = refreshSegmentSuggestions(JSON.parse(segmentsRaw) as Segment[])
  const metadata = sourceManifest.video

  if (!metadata?.title) {
    throw new Error(`Source package ${sourceSlug} is missing video metadata in sources/${sourceSlug}/source.json`)
  }

  const existingSlugs = Object.fromEntries(
    (sourceManifest.draftCarousels ?? [])
      .map((entry) => [entry.segmentId, entry.slug])
      .filter((entry): entry is [string, string] => Boolean(entry[0] && entry[1])),
  )
  const draftBundles = buildDraftCarouselBundles(metadata, sourceSlug, segments, existingSlugs)
  await writeFile(path.join(sourceDir, 'segments.json'), `${JSON.stringify(segments, null, 2)}\n`, 'utf8')

  for (const bundle of draftBundles) {
    await mkdir(path.resolve('carousels', bundle.carousel.slug), { recursive: true })
    await mkdir(path.resolve('drafts', sourceSlug, bundle.carousel.slug), { recursive: true })
    await upsertCarouselDirectoryItem(bundle.carousel)
    await writeFile(path.resolve('carousels', bundle.carousel.slug, 'carousel.md'), renderCarouselMarkdown(bundle.carousel), 'utf8')
    await writeFile(path.resolve('drafts', sourceSlug, bundle.carousel.slug, 'post-brief.md'), bundle.briefMarkdown, 'utf8')
  }

  console.log(`Rebuilt ${draftBundles.length} draft carousel${draftBundles.length === 1 ? '' : 's'} for ${sourceSlug}`)
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

function printUsageAndExit(): never {
  console.error('Usage: content-carousel youtube <youtube-url> [--slug your-slug] [--whisper-model base] [--max-segments 8]')
  process.exit(1)
}

async function fetchVideoMetadata(url: string): Promise<VideoMetadata> {
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
  const response = await fetch(oembedUrl)
  if (!response.ok) {
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

function selectEditorialSegments(segments: Segment[], maxSegments: number) {
  const selected: Segment[] = []

  for (const segment of segments) {
    if (selected.length >= maxSegments) break
    if (!passesEditorialFilter(segment)) continue
    if (selected.some((existing) => areNearDuplicates(existing, segment))) continue
    selected.push({ ...segment, rank: selected.length + 1 })
  }

  if (selected.length > 0) {
    return selected
  }

  return segments.slice(0, maxSegments).map((segment, index) => ({ ...segment, rank: index + 1 }))
}

function passesEditorialFilter(segment: Segment) {
  const text = segment.text
  const fullSentenceCount = splitSentences(text).filter((sentence) => sentence.split(/\s+/).filter(Boolean).length >= 5).length

  if (segment.score < 4) return false
  if (segment.wordCount < 28 || segment.wordCount > 155) return false
  if (fullSentenceCount < 2) return false
  if (/^(and|but|so|because|which|that|then)\b/i.test(text)) return false
  if (/^[a-z]/.test(text)) return false
  if (/\b(thanks for watching|subscribe|welcome back|link in the description)\b/i.test(text)) return false
  return true
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

function buildDraftCarouselBundles(metadata: VideoMetadata, sourceSlug: string, segments: Segment[], existingSlugs: ExistingSlugMap = {}): DraftCarouselBundle[] {
  return segments.map((segment) => {
    const carouselSlug = existingSlugs[segment.id] || buildCarouselSlug(sourceSlug, segment)
    const carousel = buildDraftCarousel(metadata, sourceSlug, carouselSlug, segment, segments)
    return {
      segment,
      carousel,
      briefMarkdown: buildDraftNotes(metadata, sourceSlug, carousel, segment, segments),
    }
  })
}

function buildSummary(metadata: VideoMetadata, sourceSlug: string, draftBundles: DraftCarouselBundle[], segments: Segment[]) {
  const top = segments.slice(0, 5)
  return `# Source Summary\n\n## Video\n- Title: ${metadata.title}\n- Creator: ${metadata.authorName ?? 'Unknown'}\n\n## Draft carousels created automatically\n- Source slug: ${sourceSlug}\n- Draft count: ${draftBundles.length}\n${draftBundles
    .map(
      (bundle) => `- ${bundle.carousel.slug} → /carousel/${bundle.carousel.slug} (from ${bundle.segment.id}, ${bundle.segment.start} → ${bundle.segment.end}, score ${bundle.segment.score})`,
    )
    .join('\n')}\n\n## Best candidate segments\n${top
    .map(
      (segment) => `\n### #${segment.rank} — ${segment.titleSuggestion}\n- Score: ${segment.score}\n- Time: ${segment.start} → ${segment.end}\n- Hook: ${segment.hook}\n- Why it could work:\n${segment.whyItCouldWork.map((reason) => `  - ${reason}`).join('\n')}\n`,
    )
    .join('\n')}\n## Editorial note\nEach generated carousel comes from one selected editorial segment. Selection rules: score >= 4, 28-155 words, at least 2 full sentences, no obvious intro/outro junk, and no near-duplicate overlap with a stronger pick.\n`
}

function buildDraftNotes(metadata: VideoMetadata, sourceSlug: string, carousel: Carousel, primary: Segment, segments: Segment[]) {
  const alternates = segments.filter((segment) => segment.id !== primary.id).slice(0, 3)
  return `# ${metadata.title}\n\nSource slug: ${sourceSlug}\nCarousel slug: ${carousel.slug}\nStatus: draft carousel created automatically\nPrimary source segment: ${primary.id} (${primary.start} → ${primary.end})\n\n## Default output\nThis ingest run created a previewable draft carousel at \`carousels/${carousel.slug}/carousel.md\`.\nIts source artifacts still live under \`sources/${sourceSlug}/\`.\n\n## Draft carousel angle\n- Title: ${carousel.title}\n- Description: ${carousel.description}\n- Raw hook: ${primary.hook}\n\n## Primary source text\n\n> ${primary.text}\n\n## Alternate source options\n${alternates
    .map(
      (segment) => `\n### ${segment.id}: ${segment.titleSuggestion}\n- Time range: ${segment.start} → ${segment.end}\n- Raw hook: ${segment.hook}\n- Angle: ${segment.whyItCouldWork[0]}\n\n> ${segment.text}\n`,
    )
    .join('\n')}\n## Next editing pass\n- tighten slide 1 until it punches harder\n- trim any slide body that still sounds transcript-y\n- verify claims, numbers, and examples\n- if needed, swap in a better segment from \`sources/${sourceSlug}/segments.json\`\n`
}

function buildDraftCarousel(metadata: VideoMetadata, sourceSlug: string, carouselSlug: string, primary: Segment, segments: Segment[]): Carousel {
  const companionSegments = segments.filter((segment) => segment.id !== primary.id)
  const primaryThoughts = getCompleteThoughts(primary.text)
  const companionThoughts = companionSegments.flatMap((segment) => getCompleteThoughts(segment.text))
  const support = uniqueNormalized([...primaryThoughts.slice(1), ...companionThoughts]).filter((sentence) => sentence.length >= 24)

  const opening = pickDisplayLine([
    primaryThoughts[0] ?? '',
    primary.hook,
    primary.titleSuggestion,
    'AI operating models are getting stale faster than most teams realize.',
  ], { preferredMax: 84 }) ?? 'AI operating models are getting stale faster than most teams realize.'

  const slides: CarouselSlide[] = [
    {
      id: '01',
      eyebrow: 'AUTO DRAFT',
      title: opening,
      body: buildBodyLines([
        support[0] ?? 'The useful move is turning the clearest claim into an operational decision.',
        support[1] ?? 'Teams that keep using old assumptions are already making slower and worse calls.',
      ]),
    },
    {
      id: '02',
      eyebrow: 'WHY IT MATTERS',
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
      eyebrow: 'THE REAL SHIFT',
      title: pickDisplayLine([
        companionSegments[0]?.hook ?? '',
        support[4] ?? '',
        'The skill is maintaining calibration as the boundary keeps moving.',
      ], { preferredMax: 84 }) ?? 'The skill is maintaining calibration as the boundary keeps moving.',
      body: buildBodyLines([
        support[5] ?? 'What worked as a rule of thumb a few months ago can already be wrong now.',
        support[6] ?? 'Operators need current failure models, not generic vibes.',
      ]),
    },
    {
      id: '04',
      eyebrow: 'OPERATING MODEL',
      title: pickDisplayLine([
        companionSegments[1]?.hook ?? '',
        support[7] ?? '',
        'Human attention becomes the real bottleneck.',
      ], { preferredMax: 84 }) ?? 'Human attention becomes the real bottleneck.',
      body: buildBodyLines([
        support[8] ?? 'As agents improve, the question becomes what deserves review and what can safely flow through.',
        support[9] ?? 'Attention allocation becomes part of the skill.',
      ]),
    },
    {
      id: '05',
      eyebrow: 'TAKEAWAY',
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
    title: `Draft: ${removeDraftPrefix(titleBaseFromSlides(slides))}`,
    description: `Auto-generated draft carousel from ${metadata.authorName ?? 'YouTube'} transcript source: ${metadata.title} (${primary.start} → ${primary.end}).`,
    sourceType: 'transcript',
    aspectRatio: 'portrait',
    updatedAt: new Date().toISOString().slice(0, 10),
    theme: DEFAULT_THEME,
    slides,
  }
}

function titleBaseFromSlides(slides: CarouselSlide[]) {
  return slides[0]?.title?.trim() || 'Draft carousel'
}

function buildBodyLines(lines: string[]) {
  return uniqueNormalized(lines)
    .filter((line) => !/[.…]$/.test(line) || /[.!?]$/.test(line))
    .slice(0, 2)
    .join('\n\n')
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

function removeDraftPrefix(text: string) {
  return text.replace(/^draft:\s*/i, '').trim()
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

async function autoCommitAndPushGeneratedChanges(sourceSlug: string, bundles: DraftCarouselBundle[]) {
  if (process.env.CONTENT_CAROUSEL_SKIP_PUSH === '1') {
    console.log('Auto-push skipped because CONTENT_CAROUSEL_SKIP_PUSH=1.')
    return
  }

  const paths = [
    path.join('sources', sourceSlug),
    path.join('drafts', sourceSlug),
    ...bundles.map((bundle) => path.join('carousels', bundle.carousel.slug)),
    path.join('carousels', 'index.json'),
  ]

  const { stdout: insideWorkTree } = await execFileAsync('git', ['rev-parse', '--is-inside-work-tree'], {
    cwd: process.cwd(),
  }).catch(() => ({ stdout: 'false' }))

  if (insideWorkTree.trim() !== 'true') {
    console.warn('Skipping auto-push: current directory is not a git work tree.')
    return
  }

  await execFileAsync('git', ['add', '--', ...paths], { cwd: process.cwd() })

  const { stdout: stagedDiff } = await execFileAsync('git', ['diff', '--cached', '--name-only', '--', ...paths], {
    cwd: process.cwd(),
  })

  const changedFiles = stagedDiff
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (changedFiles.length === 0) {
    console.log('Auto-push skipped: no generated changes to commit.')
    return
  }

  const message = `chore: ingest youtube source ${sourceSlug}`
  await execFileAsync('git', ['commit', '-m', message, '--', ...paths], { cwd: process.cwd(), maxBuffer: 10 * 1024 * 1024 })

  const { stdout: currentBranch } = await execFileAsync('git', ['branch', '--show-current'], { cwd: process.cwd() })
  const branch = currentBranch.trim() || 'main'
  const hasUpstream = await execFileAsync('git', ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], {
    cwd: process.cwd(),
  })
    .then(() => true)
    .catch(() => false)

  await execFileAsync('git', hasUpstream ? ['push'] : ['push', '--set-upstream', 'origin', branch], {
    cwd: process.cwd(),
    maxBuffer: 10 * 1024 * 1024,
  })

  console.log(`Auto-pushed ${changedFiles.length} generated file${changedFiles.length === 1 ? '' : 's'} to ${branch}`)
}

async function upsertCarouselDirectoryItem(carousel: Carousel) {
  const indexPath = path.resolve('carousels/index.json')
  let items: CarouselDirectoryItem[] = []

  try {
    items = JSON.parse(await readFile(indexPath, 'utf8')) as CarouselDirectoryItem[]
  } catch {
    items = []
  }

  const directoryItem: CarouselDirectoryItem = {
    slug: carousel.slug,
    title: carousel.title,
    description: carousel.description,
    sourceType: carousel.sourceType,
    aspectRatio: carousel.aspectRatio,
    updatedAt: carousel.updatedAt,
    theme: carousel.theme,
  }

  const existingIndex = items.findIndex((item) => item.slug === carousel.slug)
  if (existingIndex >= 0) {
    items[existingIndex] = directoryItem
  } else {
    items.unshift(directoryItem)
  }

  await writeFile(indexPath, `${JSON.stringify(items, null, 2)}\n`, 'utf8')
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
