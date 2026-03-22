# content-carousel-studio

Next.js-powered carousel studio for transcript-driven social content.

## CLI

The repo now exposes a first-class CLI:

```bash
./content-carousel <command>
```

Primary commands:

```bash
./content-carousel youtube <youtube-url>
./content-carousel render <slug>
./content-carousel render-all
./content-carousel build-pages
```

If you install or link the package as a binary, the same commands are available as `content-carousel ...`.

The existing `pnpm ingest:youtube`, `pnpm render`, `pnpm render:all`, and `pnpm build:pages` scripts still work. They now delegate to the same CLI entrypoint.

## What this repo does now

- ingest a YouTube video into source artifacts **and** a draft carousel
- author carousel copy in a single markdown file per carousel
- preview every carousel locally in Next.js
- export the site as a static GitHub Pages bundle
- render every carousel slide to PNG files
- publish both the live preview pages **and** PNG batches on GitHub Pages

So the repo stays Next-based, but the output is Pages-safe.

## Important URL pattern

Once GitHub Pages is enabled for this repo, every carousel preview lives at:

```text
https://maurilio-saddoud.github.io/content-carousel-studio/carousel/<slug>/
```

And every PNG batch lives at:

```text
https://maurilio-saddoud.github.io/content-carousel-studio/exports/<slug>/
```

There is also a batch index page at:

```text
https://maurilio-saddoud.github.io/content-carousel-studio/exports/
```

## Repo structure

- `app/` — Next.js App Router pages
- `components/` — reusable carousel presentation components
- `carousels/` — one folder per carousel, with `carousel.md` as the main source file
- `drafts/` — editorial notes / briefs for a source package
- `sources/` — raw source material and notes
- `lib/` — shared data loaders and types
- `scripts/` — ingest, Pages build, and PNG rendering scripts
- `public/exports/` — generated PNG batches + manifests + simple download pages
- `out/` — static export produced for GitHub Pages deployment

## Install

```bash
pnpm install
```

## Markdown carousel format

The content layer is now **markdown-first**.

Each carousel lives in:

```text
carousels/<slug>/carousel.md
```

Format:

1. YAML frontmatter for carousel-level metadata
2. slide sections separated by a line containing exactly `---`
3. each slide starts with an optional `eyebrow: ...` line
4. the slide title is the first markdown heading
5. the rest of the slide is markdown-ish body copy
6. do not add `variant:` lines — the markdown itself should drive the slide
   - paragraphs work out of the box
   - simple unordered lists (`- item`) also render

Example:

```md
---
slug: ai-memory-wall
title: AI Memory Wall
description: A bite-sized carousel about memory systems.
sourceType: transcript
aspectRatio: portrait
updatedAt: 2026-03-21
theme:
  accent: "#1D9BF0"
  background: "#000000"
  foreground: "#E7E9EA"
  muted: "#71767B"
---

eyebrow: AI DEPLOYMENTS

# AI agents are getting better.

The people deploying them are not.

The capability curve is real.

---

eyebrow: THE REAL WALL

# The wall isn’t just intelligence.

It’s memory.

- Agents can do impressive work in short bursts.
- Real work has continuity, history, and trade-offs.
```

### Notes on parsing

- The loader prefers `carousel.md`.
- If a carousel still only has `carousel.json`, the app falls back to that legacy format.
- The markdown body is intentionally simple right now so it stays human-editable and predictable in screenshots.

## Workflow 1: ingest a YouTube video

Basic usage:

```bash
./content-carousel youtube 'https://www.youtube.com/watch?v=VIDEO_ID'
```

Optional explicit slug:

```bash
./content-carousel youtube 'https://www.youtube.com/watch?v=VIDEO_ID' --slug my-topic-slug
```

Optional segment/draft limit:

```bash
./content-carousel youtube 'https://www.youtube.com/watch?v=VIDEO_ID' --max-segments 6
```

### What ingest creates

One command now does the practical first pass:

1. fetches the official YouTube transcript first
2. falls back to local Whisper transcription if captions are missing
3. writes source artifacts into `sources/<source-slug>/`
4. selects up to `--max-segments` editorially-usable transcript segments
5. creates one markdown-first draft carousel per selected segment
6. writes per-draft notes under `drafts/<source-slug>/<carousel-slug>/post-brief.md`
7. creates or updates `carousels/<carousel-slug>/carousel.md`
8. refreshes `carousels/index.json` as a legacy/generated directory artifact
9. auto-commits and pushes the generated draft/source files to the current Git branch so GitHub Pages can rebuild immediately

Created files look like this:

```text
sources/<source-slug>/source.json
sources/<source-slug>/raw-transcript.md
sources/<source-slug>/clean-transcript.md
sources/<source-slug>/segments.json
sources/<source-slug>/summary.md
drafts/<source-slug>/<carousel-slug>/post-brief.md
carousels/<carousel-slug>/carousel.md
carousels/index.json
```

Slug pattern for generated carousel drafts:

```text
<source-slug>--segment-02-00-03-41-<angle-slug>
<source-slug>--segment-05-00-08-12-<angle-slug>
<source-slug>--segment-11-00-14-09-<angle-slug>
```

So each draft slug is tied to the selected transcript segment itself (`segment id + start timestamp`), not just the fanout order from one run.

Selection rule for generating multiple drafts:

- segment must pass the editorial filter
- score must be at least `4`
- length must be between `28` and `155` words
- must contain at least `2` full sentences
- obvious intro/outro junk gets rejected
- near-duplicate segments are skipped

That means one source package can immediately fan out into multiple previewable/exportable carousel drafts.

### Auto-push behavior after ingest

After a successful `./content-carousel youtube ...` run, the CLI now stages only the generated paths for that source package:

- `sources/<source-slug>/`
- `drafts/<source-slug>/`
- each generated `carousels/<carousel-slug>/`
- `carousels/index.json`

If those staged files actually changed, it creates a commit like:

```text
chore: ingest youtube source <source-slug>
```

Then it pushes to the current branch (or sets upstream to `origin/<branch>` if needed). If nothing changed, it skips the commit/push cleanly.

If you need a dry local ingest without a push (for testing), set `CONTENT_CAROUSEL_SKIP_PUSH=1` for that run.

## Workflow 2: preview locally while editing

Run the app:

```bash
pnpm dev
```

Open:

- `http://localhost:3000/` — carousel table of contents
- `http://localhost:3000/carousel/<slug>` — a single carousel preview

## Workflow 3: build the GitHub Pages site + PNG outputs

Run:

```bash
./content-carousel build-pages
```

What this does:

1. builds a static Next export into `out/`
2. serves that static export locally for rendering
3. renders PNGs for every carousel into `public/exports/<slug>/`
4. writes `manifest.json` and a tiny batch gallery page for each slug
5. rebuilds the static site so the PNG files are included in `out/`

After that you have:

- `out/` — the exact GitHub Pages artifact
- `public/exports/<slug>/01.png`, `02.png`, etc.
- `public/exports/<slug>/manifest.json`
- `public/exports/<slug>/index.html`
- `public/exports/index.html`
- `public/exports/index.json`

## Workflow 4: get the public GitHub Pages preview

This repo includes `.github/workflows/deploy-pages.yml`.

On every push to `main`, GitHub Actions now:

1. installs dependencies
2. installs Playwright Chromium
3. runs `pnpm build:pages`
4. uploads `out/`
5. deploys to GitHub Pages

So the public preview URL pattern is always:

```text
https://maurilio-saddoud.github.io/content-carousel-studio/carousel/<slug>/
```

Example if the slug is `ai-memory-wall`:

```text
https://maurilio-saddoud.github.io/content-carousel-studio/carousel/ai-memory-wall/
```

## Workflow 5: get the PNGs

### Local files

After `pnpm build:pages`, the easiest local location is:

```text
public/exports/<slug>/
```

You will find:

- numbered slide PNGs like `01.png`, `02.png`, `03.png`
- `manifest.json` with the file list
- `index.html` with a dead-simple gallery/download page

### Public URLs

After the Pages deploy finishes, the PNGs are publicly reachable at:

```text
https://maurilio-saddoud.github.io/content-carousel-studio/exports/<slug>/
```

Direct file pattern:

```text
https://maurilio-saddoud.github.io/content-carousel-studio/exports/<slug>/01.png
```

Manifest pattern:

```text
https://maurilio-saddoud.github.io/content-carousel-studio/exports/<slug>/manifest.json
```

Global batch index:

```text
https://maurilio-saddoud.github.io/content-carousel-studio/exports/
```

## Type-checking

```bash
pnpm lint
```

## Notes / tradeoffs

- GitHub Pages is static-only, so the app is configured for `next export` output.
- Carousel routes are generated from the markdown carousel files on disk.
- PNG generation uses Playwright screenshots of the rendered Pages-safe site.
- The markdown parser intentionally supports a narrow authoring format right now: frontmatter + slide separators + paragraphs/lists.
- `pnpm start` is still there, but the real deploy target is GitHub Pages, not a Node server.
- If you add a carousel and want it public, it still needs to be committed and pushed to `main`. Pages is public, not magical.
