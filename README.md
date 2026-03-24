# content-carousel-studio

Next.js-powered carousel studio for transcript-driven social content, with a markdown-first publish layer.

## CLI

The repo now exposes a first-class CLI:

```bash
./content-carousel <command>
```

Primary commands:

```bash
./content-carousel youtube <youtube-url>
./content-carousel rebuild-source <source-slug>
./content-carousel render <slug>
./content-carousel render-all
./content-carousel self-test <source-slug>
./content-carousel self-test <source-slug> --json
./content-carousel self-test --repo
./content-carousel self-test --repo --json
./content-carousel sync-source <source-slug>
./content-carousel build-pages
```

If you install or link the package as a binary, the same commands are available as `content-carousel ...`.

The existing `pnpm ingest:youtube`, `pnpm render`, `pnpm render:all`, and `pnpm build:pages` scripts still work. They now delegate to the same CLI entrypoint.

`./content-carousel rebuild-source <source-slug>` reuses the source package's stored publish limit by default, so a quick rebuild does not silently fan out from a curated 2-post package to the CLI fallback of 8 posts. You can still override it explicitly with `--max-segments`.

`./content-carousel sync-source <source-slug>` is the lightweight repair path when `ideas.json` / `briefs.json` / surviving `carousel.md` files are the canonical truth but `source.json` drifted after dropped segments or partial cleanup. It rewrites `source.json`, regenerates `summary.md`, and demotes orphaned `published` ideas whose markdown no longer exists.

## What this repo does now

- ingest a YouTube video into source artifacts, ranked ideas, and published carousel markdown
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
- `carousels/` — one folder per published carousel, with `carousel.md` as the source of truth
- `sources/` — raw source material, ranked transcript segments, candidate ideas, and ingest summaries
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
6. do not add `variant:` lines — they are intentionally unsupported now; the markdown itself should drive the slide
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

Optional segment limit:

```bash
./content-carousel youtube 'https://www.youtube.com/watch?v=VIDEO_ID' --max-segments 6
```

### What ingest creates

One command now does the practical first pass:

1. fetches the official YouTube transcript first
2. falls back to local Whisper transcription if captions are missing
3. writes source artifacts into `sources/<source-slug>/`
4. ranks transcript segments into idea candidates
5. rejects weak or overlapping ideas
6. promotes the strongest surviving ideas into distinct editorial briefs
7. publishes up to `--max-segments` briefs as markdown carousels
8. removes superseded carousel/export artifacts from earlier ingests of the same source
9. refreshes `carousels/index.json` as a generated compatibility artifact

Created files look like this:

```text
sources/<source-slug>/source.json
sources/<source-slug>/raw-transcript.md
sources/<source-slug>/clean-transcript.md
sources/<source-slug>/segments.json
sources/<source-slug>/ideas.json
sources/<source-slug>/briefs.json
sources/<source-slug>/summary.md
carousels/<carousel-slug>/carousel.md
carousels/index.json
```

Slug pattern for generated carousels:

```text
<source-slug>--segment-02-00-03-41-<angle-slug>
<source-slug>--segment-05-00-08-12-<angle-slug>
<source-slug>--segment-11-00-14-09-<angle-slug>
```

So each carousel slug is tied to the selected transcript segment itself (`segment id + start timestamp`), not just the fanout order from one run.

Selection and publishing rules:

- every ranked segment becomes an idea record in `sources/<source-slug>/ideas.json`
- weak ideas are rejected with explicit reasons
- overlapping ideas are filtered against stronger ideas
- the strongest surviving ideas become published markdown carousels
- only published markdown carousels appear in the app TOC and Pages export indexes

That means one source package can fan out into multiple previewable/exportable carousels without leaking non-published ideas into the site.

### Published output behavior

Published carousels live only in:

- `carousels/<carousel-slug>/carousel.md`
- `carousels/index.json`

That markdown is the source of truth for anything user-facing:

- the site table of contents
- static carousel routes
- the PNG export index
- the GitHub Pages export bundle

Re-ingesting the same source replaces the published set for that source and removes stale carousel/export directories so old slugs do not linger.

## Pages-first sharing

After `./content-carousel build-pages` and a push, share the GitHub Pages preview URL first:

```text
https://maurilio-saddoud.github.io/content-carousel-studio/carousel/<slug>/
```

Use the PNG batch as the secondary operational link:

```text
https://maurilio-saddoud.github.io/content-carousel-studio/exports/<slug>/
```

The repo no longer auto-pushes on ingest. Build, review, and push deliberately after the published set looks right.

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
- `./content-carousel self-test <source-slug>` is the quickest repeatability check after ingest/rebuild/render. It audits source.json ↔ ideas.json consistency, brief quality/overlap, weak/duplicate titles, and export drift before you bother publishing.
- `./content-carousel self-test --repo` is the repo-wide repeatability sweep. It runs every source audit, then checks cross-package duplicate carousel/slide titles plus stale `carousels/`, `public/exports/`, and `.next/server/app/carousel/` residue.
- Add `--json` when you want to persist the audit result, diff hourly runs, or hand the same issue set to another agent without scraping console text.
- Missing markdown refs are now triaged more explicitly: the self-test tells you whether the slug still has leftover export artifacts or whether the source manifest points at a slug with no local artifacts at all (usually a dropped segment that never got cleaned out of `source.json`).
- When that orphaned-manifest state is real, `./content-carousel sync-source <source-slug>` is now the deliberate repair path. It keeps surviving briefs/carousels, rewrites `source.json`, refreshes `summary.md`, and demotes stale `published` ideas in `ideas.json` so self-test stops reporting fake publication drift.
- Use `./content-carousel self-test <source-slug> --strict-global` only when you intentionally want to compare one source package against the rest of the workspace. The default source check assumes preserving older batches is normal.
- `pnpm exec tsx scripts/self-test.ts <source-slug>` now works too when you want to iterate on the audit logic directly without going through the bundled CLI.
- In the current operator workflow, a newly supplied video link should usually be treated as an implicit request to generate a fresh preview batch from that source, not as a prompt for another round of clarification.
- Preserve existing preview batches by default. Only wipe/delete old previews when the user explicitly asks for replacement or cleanup.
- If you add a carousel and want it public, it still needs to be committed and pushed to `main`. Pages is public, not magical.
