# content-carousel-studio

Next.js-powered carousel studio for transcript-driven social content.

## What this repo does now

- ingest a YouTube video into source artifacts **and** a draft carousel
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
- `carousels/` — previewable carousel configs, including auto-generated drafts
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

## Workflow 1: ingest a YouTube video

Basic usage:

```bash
pnpm ingest:youtube 'https://www.youtube.com/watch?v=VIDEO_ID'
```

Optional explicit slug:

```bash
pnpm ingest:youtube 'https://www.youtube.com/watch?v=VIDEO_ID' --slug my-topic-slug
```

Optional segment limit:

```bash
pnpm ingest:youtube 'https://www.youtube.com/watch?v=VIDEO_ID' --max-segments 6
```

### What ingest creates

One command now does the practical first pass:

1. fetches the official YouTube transcript first
2. falls back to local Whisper transcription if captions are missing
3. writes source artifacts into `sources/<slug>/`
4. creates editorial notes in `drafts/<slug>/post-brief.md`
5. creates or updates `carousels/<slug>/carousel.json`
6. updates `carousels/index.json`

Created files:

```text
sources/<slug>/source.json
sources/<slug>/raw-transcript.md
sources/<slug>/clean-transcript.md
sources/<slug>/segments.json
sources/<slug>/summary.md
drafts/<slug>/post-brief.md
carousels/<slug>/carousel.json
carousels/index.json
```

That means the carousel becomes part of the static site inventory immediately.

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
pnpm build:pages
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
- Carousel routes are statically generated from `carousels/index.json`.
- PNG generation uses Playwright screenshots of the rendered Pages-safe site.
- `pnpm start` is still there, but the real deploy target is now GitHub Pages, not a Node server.
- If you add a carousel and want it public, it still needs to be committed and pushed to `main`. Pages is public, not magical.
