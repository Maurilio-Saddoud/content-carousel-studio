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
  fillerPenalty: number
  lyricPenalty: number
  repetitionPenalty: number
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

const TRANSCRIPT_TOOL_PATH = path.resolve('../youtube-transcript-v1/yt_transcript.py')
const RAW_TRANSCRIPT_RE = /^\[(\d{2}):(\d{2}):(\d{2})\]\s+(.*)$/
const execFileAsync = promisify(execFile)

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.url) {
    printUsageAndExit()
  }

  const metadata = await fetchVideoMetadata(args.url)
  const slug = args.slug ?? slugify(metadata.title || args.url)
  const sourceDir = path.resolve('sources', slug)
  const draftDir = path.resolve('drafts', slug)

  await mkdir(sourceDir, { recursive: true })
  await mkdir(draftDir, { recursive: true })

  const { transcript, transcriptMode } = await fetchTranscript(args.url, args.whisperModel)
  const transcriptLines = parseTranscript(transcript)

  if (transcriptLines.length === 0) {
    throw new Error('Transcript fetch succeeded but returned zero timestamped lines.')
  }

  const cleanTranscript = buildCleanTranscript(transcriptLines)
  const segments = rankSegments(segmentTranscript(transcriptLines)).slice(0, args.maxSegments)
  const summary = buildSummary(metadata, segments)
  const draftNotes = buildDraftNotes(metadata, slug, segments)

  const sourceManifest = {
    slug,
    sourceType: 'transcript',
    sourceUrl: args.url,
    fetchedAt: new Date().toISOString(),
    transcriptMode,
    whisperModel: args.whisperModel,
    video: metadata,
    transcriptLineCount: transcriptLines.length,
    createdFiles: [
      `sources/${slug}/source.json`,
      `sources/${slug}/raw-transcript.md`,
      `sources/${slug}/clean-transcript.md`,
      `sources/${slug}/segments.json`,
      `sources/${slug}/summary.md`,
      `drafts/${slug}/post-brief.md`,
    ],
  }

  await writeFile(path.join(sourceDir, 'source.json'), `${JSON.stringify(sourceManifest, null, 2)}\n`, 'utf8')
  await writeFile(path.join(sourceDir, 'raw-transcript.md'), renderRawTranscript(metadata, args.url, transcript), 'utf8')
  await writeFile(path.join(sourceDir, 'clean-transcript.md'), renderCleanTranscript(metadata, cleanTranscript), 'utf8')
  await writeFile(path.join(sourceDir, 'segments.json'), `${JSON.stringify(segments, null, 2)}\n`, 'utf8')
  await writeFile(path.join(sourceDir, 'summary.md'), summary, 'utf8')
  await writeFile(path.join(draftDir, 'post-brief.md'), draftNotes, 'utf8')

  console.log(`Created semi-automatic source package for ${slug}`)
  for (const file of sourceManifest.createdFiles) {
    console.log(`- ${file}`)
  }
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
  console.error('Usage: pnpm ingest:youtube <youtube-url> [--slug your-slug] [--whisper-model base] [--max-segments 8]')
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

  const command = [
    'run',
    '--with',
    'youtube-transcript-api',
    '--with',
    'yt-dlp',
    'python',
    TRANSCRIPT_TOOL_PATH,
    url,
  ]

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
    const boundaryCue = /^(but|so|because|here'?s|the problem|the truth|if|when)\b/i.test(lines[i].text)

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
    .sort((a, b) => b.score - a.score || a.wordCount - b.wordCount)
    .map((segment, index) => ({ ...segment, rank: index + 1 }))
}

function scoreSegment(text: string): SegmentScoreBreakdown {
  const lower = text.toLowerCase()
  const words = lower.split(/\s+/).filter(Boolean)
  const wordCount = words.length

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
  ]) * 2

  const contrast = countMatches(lower, ['but', 'instead', 'however', 'not', 'without', 'yet']) * 2
  const specificity = countRegex(text, /\b\d+\b/g) * 2 + countRegex(text, /\b[A-Z]{2,}\b/g) + countMatches(lower, ['client', 'team', 'system', 'process', 'agent'])
  const structure = /[:;]/.test(text) ? 2 : 0
  const question = text.includes('?') ? 3 : 0
  const credibility = countMatches(lower, ['i built', 'i learned', 'we learned', 'in practice', 'real', 'actually']) * 2
  const fillerPenalty = -countMatches(lower, ['um', 'uh', 'like', 'you know', 'sort of']) * 2
  const lyricPenalty = /♪/.test(text) ? -12 : 0

  const uniqueWords = new Set(words.map((word) => word.replace(/[^a-z0-9]/g, '')).filter(Boolean))
  const lexicalDiversity = wordCount > 0 ? uniqueWords.size / wordCount : 0
  const repetitionPenalty = lexicalDiversity < 0.45 ? -6 : 0

  let lengthPenalty = 0
  if (wordCount < 25) lengthPenalty = -6
  else if (wordCount < 40) lengthPenalty = -2
  else if (wordCount > 140) lengthPenalty = -8
  else if (wordCount > 110) lengthPenalty = -4

  return {
    hookWords,
    contrast,
    specificity,
    structure,
    question,
    credibility,
    fillerPenalty,
    lyricPenalty,
    repetitionPenalty,
    lengthPenalty,
  }
}

function countMatches(text: string, phrases: string[]) {
  return phrases.reduce((sum, phrase) => sum + (text.includes(phrase) ? 1 : 0), 0)
}

function countRegex(text: string, regex: RegExp) {
  return [...text.matchAll(regex)].length
}

function suggestTitle(text: string) {
  const sentences = splitSentences(text)
  const best = sentences.find((sentence) => sentence.length >= 32 && sentence.length <= 110) ?? sentences[0] ?? text
  return trimSentence(best, 84)
}

function suggestHook(text: string) {
  const sentences = splitSentences(text)
  const direct = sentences.find((sentence) => /\b(problem|mistake|truth|why|if|without|not)\b/i.test(sentence))
  return trimSentence(direct ?? sentences[0] ?? text, 120)
}

function explainSegment(score: SegmentScoreBreakdown, text: string) {
  const reasons: string[] = []
  if (score.hookWords > 0) reasons.push('contains strong hook language instead of bland exposition')
  if (score.contrast > 0) reasons.push('has contrast/tension, which usually makes better post framing')
  if (score.specificity > 0) reasons.push('includes enough specificity to avoid sounding generic')
  if (score.question > 0) reasons.push('ends in or includes a question that can drive engagement')
  if (score.credibility > 0) reasons.push('sounds grounded in lived or practical experience')
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

function trimSentence(text: string, max: number) {
  if (text.length <= max) return text
  return `${text.slice(0, max - 1).trimEnd()}…`
}

function buildSummary(metadata: VideoMetadata, segments: Segment[]) {
  const top = segments.slice(0, 5)
  return `# Source Summary\n\n## Video\n- Title: ${metadata.title}\n- Creator: ${metadata.authorName ?? 'Unknown'}\n\n## Best candidate segments\n${top
    .map(
      (segment) => `\n### #${segment.rank} — ${segment.titleSuggestion}\n- Score: ${segment.score}\n- Time: ${segment.start} → ${segment.end}\n- Hook: ${segment.hook}\n- Why it could work:\n${segment.whyItCouldWork.map((reason) => `  - ${reason}`).join('\n')}\n`,
    )
    .join('\n')}\n## Editorial note\nThese are ranked source chunks, not finished posts. They still need human taste, trimming, positioning, and voice shaping before they become a carousel or text post.\n`
}

function buildDraftNotes(metadata: VideoMetadata, slug: string, segments: Segment[]) {
  const top = segments.slice(0, 3)
  return `# ${metadata.title}\n\nSlug: ${slug}\nStatus: draft-ready source package\n\n## Recommended editorial path\nPick one of the top-ranked segments below and turn it into a single clear thesis. Do not try to merge all of them into one carousel unless they genuinely support the same point.\n\n## Top options\n${top
    .map(
      (segment) => `\n### Option ${segment.rank}: ${segment.titleSuggestion}\n- Time range: ${segment.start} → ${segment.end}\n- Raw hook: ${segment.hook}\n- Angle: ${segment.whyItCouldWork[0]}\n- First edit pass: remove filler, tighten claims, and pull the sharpest sentence to slide 1 / opening line.\n- Source text:\n\n> ${segment.text}\n`,
    )
    .join('\n')}\n## Manual/editorial work still required\n- choose the one real thesis worth publishing\n- rewrite for Maurilio's voice and audience\n- verify any claims, numbers, or examples\n- decide whether this becomes a text post, carousel, or talking-head script\n- if it becomes a carousel: write slide-by-slide copy and only then add a final carousels/${slug}/carousel.json\n`
}

function renderRawTranscript(metadata: VideoMetadata, url: string, transcript: string) {
  return `# Raw Transcript\n\n- Title: ${metadata.title}\n- Creator: ${metadata.authorName ?? 'Unknown'}\n- URL: ${url}\n\n---\n\n${transcript.trim()}\n`
}

function renderCleanTranscript(metadata: VideoMetadata, paragraphs: string[]) {
  return `# Clean Transcript\n\n- Title: ${metadata.title}\n- Creator: ${metadata.authorName ?? 'Unknown'}\n\n---\n\n${paragraphs.map((paragraph) => `${paragraph}\n`).join('\n')}`
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'youtube-source'
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
