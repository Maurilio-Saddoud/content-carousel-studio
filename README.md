# content-carousel-studio

Next.js-powered carousel studio for transcript-driven social content.

## What it does

- hosts many carousels in one repo
- gives each carousel a preview route
- keeps source material and finished carousel content organized
- renders portrait PNG exports for LinkedIn / Instagram carousels
- ingests YouTube transcripts into draft-ready source packages

## Structure

- `app/` — Next.js App Router pages
- `components/` — reusable carousel presentation components
- `carousels/` — finished carousel configs
- `drafts/` — draft-ready editorial briefs that are not final carousel content yet
- `sources/` — raw source material and notes
- `lib/` — shared data loaders and types
- `scripts/` — PNG rendering + source ingestion scripts
- `public/` — static assets used by previews
- `exports/` — generated PNGs (local only)

## Local workflow

Install dependencies:

```bash
pnpm install
```

Run the preview app locally:

```bash
pnpm dev
```

Open:

- `http://localhost:3000/` — table of contents
- `http://localhost:3000/carousel/ai-memory-wall` — individual carousel preview

Build for production:

```bash
pnpm build
pnpm start
```

Render PNGs from a running local app:

```bash
pnpm render ai-memory-wall
pnpm render:all
```

If your app is not running on port 3000, set the base URL:

```bash
CAROUSEL_BASE_URL=http://127.0.0.1:4000 pnpm render ai-memory-wall
```

## Semi-automatic YouTube ingest (v1)

This repo now supports a **semi-automatic source pipeline** for YouTube videos.

It is intentionally **not** a one-click autopost tool.
It creates a structured source package so you can review, edit, and decide what deserves to become a post or carousel.

### Exact command

Basic usage:

```bash
pnpm ingest:youtube 'https://www.youtube.com/watch?v=VIDEO_ID'
```

With an explicit slug:

```bash
pnpm ingest:youtube 'https://www.youtube.com/watch?v=VIDEO_ID' --slug my-topic-slug
```

With a different Whisper fallback model:

```bash
pnpm ingest:youtube 'https://www.youtube.com/watch?v=VIDEO_ID' --whisper-model small
```

Limit how many ranked segments are saved:

```bash
pnpm ingest:youtube 'https://www.youtube.com/watch?v=VIDEO_ID' --max-segments 6
```

### Transcript fetch behavior

The ingest script uses the existing `youtube-transcript-v1` helper under the workspace.

Fetch order:

1. tries the video's official YouTube transcript/captions first
2. if captions are unavailable, falls back to local Whisper transcription

Requirements for fallback:

- `python3`
- `uv`
- `ffmpeg`
- `whisper` CLI in `PATH`

### Files created

Running the ingest command creates:

```text
sources/<slug>/source.json
sources/<slug>/raw-transcript.md
sources/<slug>/clean-transcript.md
sources/<slug>/segments.json
sources/<slug>/summary.md
drafts/<slug>/post-brief.md
```

What each file is for:

- `source.json` — metadata, source URL, transcript mode, and generation info
- `raw-transcript.md` — untouched timestamped transcript output
- `clean-transcript.md` — cleaned reading version without line-by-line timestamps
- `segments.json` — ranked candidate source chunks for posts/carousels
- `summary.md` — quick human-readable shortlist of best segments
- `drafts/<slug>/post-brief.md` — editorial brief stub for the top ideas

### How segment scoring works

`segments.json` is deterministic and heuristic-based in v1. It is **not** an LLM judgment pass.

Each segment gets a score from signals like:

- **hook words** — terms like `problem`, `mistake`, `truth`, `moat`, `why`, `fail`
- **contrast / tension** — phrases like `but`, `instead`, `however`, `not`, `without`
- **specificity** — numbers, acronyms, or concrete business/system language
- **structure** — punctuation that suggests a stronger framing shape
- **questions** — useful for engagement-style post hooks
- **credibility cues** — phrases that imply practical experience
- **penalties for filler** — `um`, `uh`, `you know`, etc.
- **penalties for lyrics / low-information repetition** — useful for preventing songs or repetitive hooks from floating to the top
- **penalties for weak length** — too short feels underdeveloped; too long usually needs trimming

This is not trying to be magic. It is trying to be useful enough to surface the best raw material fast.

### What remains manual / editorial

Still human work, on purpose:

- choosing the one real thesis worth publishing
- deciding whether the idea should become a carousel, text post, or talk track
- rewriting for Maurilio's voice
- verifying claims / numbers / examples
- trimming or combining source chunks intelligently
- writing final slide copy
- creating the final `carousels/<slug>/carousel.json` only after review

### Recommended workflow

1. Run `pnpm ingest:youtube ...`
2. Read `sources/<slug>/summary.md`
3. Open `sources/<slug>/segments.json` and skim the top 3 scored chunks
4. Use `drafts/<slug>/post-brief.md` to pick one angle
5. Only then turn the winner into a real carousel config

## Adding content

### Finished carousel

1. Add a new folder in `carousels/<slug>/carousel.json`
2. Add the carousel summary entry to `carousels/index.json`
3. Add supporting raw material under `sources/<slug>/`

### Draft-first source package

1. Run `pnpm ingest:youtube ...`
2. Review `drafts/<slug>/post-brief.md`
3. Promote to `carousels/<slug>/carousel.json` only when the idea is actually ready

## Deployment recommendation

This repo no longer assumes GitHub Pages. The cleanest default deployment target is **Vercel** because it matches the Next.js runtime out of the box and keeps routing simple.

Other workable options:

- Netlify with Next.js support
- Self-hosted Node runtime with `pnpm build && pnpm start`

If you later need fully static export again, that is possible, but it would reintroduce tradeoffs around dynamic growth and export workflows.
