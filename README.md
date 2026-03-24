# content-carousel-studio

This repo is the **actual transcript-to-carousel system** Maurilio and I built and iterated in production.

It is not just a Next.js preview app.
It is a full workflow pipeline for:

- ingesting YouTube videos
- extracting transcript/source artifacts
- ranking and filtering candidate ideas
- turning those ideas into **post-ready Twitter/X-style carousels**
- previewing them in Next.js
- exporting slide PNGs
- publishing everything to GitHub Pages

If I ever disappear, this README is meant to let another operator recreate the workflow with minimal guesswork.

---

## What this system is supposed to do

Given a YouTube link, the intended workflow is:

1. ingest the video
2. create a source package with transcript + ranked ideas + briefs
3. generate draft carousels
4. reject weak / overlapping / garbage ideas
5. polish the survivors into publishable copy
6. build the Next.js preview + PNG exports
7. commit and push the batch
8. wait for the GitHub Pages deploy to go green
9. send the live preview links

That is the operating behavior we converged on.

---

## Core repo idea

The repo has **three layers**:

### 1. Source packages
Raw and semi-structured artifacts for each video.

Lives in:

```text
sources/<source-slug>/
```

Typical files:

```text
source.json
raw-transcript.md
clean-transcript.md
segments.json
ideas.json
briefs.json
summary.md
```

### 2. Published carousel source of truth
Human-editable markdown files for the carousels that actually matter.

Lives in:

```text
carousels/<carousel-slug>/carousel.md
```

This markdown is the real source of truth for:

- preview pages
- export rendering
- indexing
- Pages deployment

### 3. Rendered/public artifacts
Generated site and image output.

Lives in:

```text
public/exports/<slug>/
out/
```

---

## Repo structure

```text
app/                    Next.js App Router pages
components/             UI components for carousel rendering
carousels/              Published carousel markdown (source of truth)
sources/                Per-video source packages
lib/                    Loaders, types, indexing helpers
scripts/                Ingest/build/render/self-test pipeline code
public/exports/         Generated slide PNG batches + gallery pages
out/                    Static export used by GitHub Pages
bin/content-carousel.js CLI entrypoint
content-carousel        local convenience wrapper
```

---

## The most important commands

Always run from the repo root.

### Ingest a YouTube video

```bash
./content-carousel youtube '<youtube-url>'
```

Optional:

```bash
./content-carousel youtube '<youtube-url>' --slug <source-slug>
./content-carousel youtube '<youtube-url>' --max-segments 6
```

### Rebuild an existing source package

```bash
./content-carousel rebuild-source <source-slug>
```

`rebuild-source` now prefers `sources/<slug>/raw-transcript.md` as the canonical upstream input for segmentation refresh. In other words: if segmentation heuristics change, a rebuild will re-cut/rerank `segments.json` from the stored transcript instead of blindly trusting an old segment snapshot.

### Render one carousel to PNGs

```bash
./content-carousel render <slug>
```

### Render all carousels to PNGs

```bash
./content-carousel render-all
```

### Self-test a source package

```bash
./content-carousel self-test <source-slug>
```

This now audits more than titles/exports. It also checks whether `summary.md` drifted from the real source artifacts (`source.json`, `ideas.json`, `briefs.json`), so a stale narrative file cannot quietly pretend a source still has published ideas when the canonical package no longer does.

When a source intentionally gates down to zero carousels, `self-test` now includes the top dropped brief attempts from `source.json` (thesis + focus/overlap reason) so a fresh agent can see *why* it gated out without rerunning the whole brief builder first.

### Self-test the whole repo

```bash
./content-carousel self-test --repo
```

Repo mode now also checks for stale local Next route artifacts under `.next/server/app/carousel/*`. If those show up while canonical source packages are already clean, the fix is usually just a fresh:

```bash
./content-carousel build-pages
```

Also: duplicate slide-title warnings are now resilient even when a thin brief burns through the normal fallback pools. The generator keeps a final reserve title path so one weak carousel cannot silently collapse back into the exact same generic heading on every middle slide.

### Resync derived source summaries

Useful when `self-test` catches `summary.md` drift but the canonical package files (`source.json`, `ideas.json`, `briefs.json`) are already correct.

```bash
./content-carousel sync-summary <source-slug>
./content-carousel sync-summary --repo
```

### Prune stale repo artifacts, then self-test again

Useful when a source package now publishes zero carousels but old markdown/export/Pages directories are still hanging around.

```bash
./content-carousel self-test --repo --prune-stale
```

### Build the Pages artifact + exports

```bash
./content-carousel build-pages
```

`build-pages` now starts each Next build from a clean `.next/` + `out/` state so stale manifest references from previously published carousels do not leak into the staged Pages artifact after a source later gates down to zero outputs.

---

## Exact environment assumptions

This project currently assumes:

- Node + pnpm
- Next.js static export workflow
- Playwright installed for screenshot rendering
- local shell access
- GitHub repo + GitHub Pages configured

Install dependencies:

```bash
pnpm install
```

Useful scripts from `package.json`:

```bash
pnpm dev
pnpm lint
pnpm build:pages
pnpm ingest:youtube '<youtube-url>'
```

---

## Local development workflow

### Start preview app

```bash
pnpm dev
```

Open:

- `http://localhost:3000/`
- `http://localhost:3000/carousel/<slug>`

### Build static Pages bundle

```bash
./content-carousel build-pages
```

This does the important full pass:

1. build static Next.js site
2. serve it locally for rendering
3. render PNGs for carousels
4. write export manifests/gallery pages
5. rebuild static export with those assets included

---

## Public URL patterns

Preview page:

```text
https://maurilio-saddoud.github.io/content-carousel-studio/carousel/<slug>/
```

Export gallery:

```text
https://maurilio-saddoud.github.io/content-carousel-studio/exports/<slug>/
```

Direct PNG example:

```text
https://maurilio-saddoud.github.io/content-carousel-studio/exports/<slug>/01.png
```

Global export index:

```text
https://maurilio-saddoud.github.io/content-carousel-studio/exports/
```

---

## Markdown carousel format

Each published carousel lives at:

```text
carousels/<slug>/carousel.md
```

Structure:

1. YAML frontmatter
2. slides separated by a line containing exactly `---`
3. optional `eyebrow: ...`
4. slide title as first markdown heading
5. body copy below

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

---

eyebrow: THE REAL WALL
# The wall isn’t just intelligence.

It’s memory.
```

---

## The workflow behavior we actually learned

This section matters more than the mechanics.
It captures the real operating rules we discovered while using the system.

### 1. A YouTube link is an implicit request to run the pipeline
Do **not** treat a supplied video as just “context” unless Maurilio says otherwise.

Default assumption:

**YouTube link → generate the batch.**

### 2. The real deliverable is not “segments generated”
Raw segments are not the finish line.
The expected output is:

- post-ready carousels
- Pages previews
- working links after deploy

If the system says “7 segments generated” but the copy is still transcript sludge, the job is **not done**.

### 3. Preserve old outputs by default
Do **not** clean old carousel outputs or preview batches unless Maurilio explicitly asks for a specific cleanup.

### 4. Do not lie about live links
A local build is not a live deploy.
Only send Pages links as “live” after the GitHub Actions Pages deployment is actually green.

### 5. Do not force everything into 5 slides
The system historically leaned on 5-slide drafts.
That is no longer a hard rule.

Current rule:

- use more or fewer slides when the idea needs it
- optimize for strongest post structure
- do not worship fixed slide count

### 6. Reject garbage instead of polishing garbage
Specificity alone is not enough.

Reject by default if the source angle is mostly:

- repo tour
- install/setup walkthrough
- hardware/spec dump
- “for your reference” narration
- dead informational sludge with no payoff

### 7. Avoid overlapping carousels
Maurilio does **not** want five paraphrases of the same point.
Prefer a **small set of distinct theses** over maximal batch size.

### 8. Source from the whole transcript when needed
This was a major correction.

The system should **not** assume every carousel must come from one clean 15-second chunk.
If segment-level selection is weak, overlapping, or yields zero good outputs:

- step back
- read the whole transcript
- identify the real high-level themes
- create a small set of non-overlapping big-picture carousels

This is critical.

The best carousels sometimes come from the **whole-video thesis**, not from one tidy transcript window.

---

## Current editorial heuristics

When evaluating whether an idea should become a carousel, use this hierarchy:

### Strong signals

- sharp thesis
- strong contrast or tension
- practical payoff
- distinct strategic angle
- clean non-overlap with sibling carousels
- can be stated in one sentence without transcript goo

### Weak signals

- specific numbers without payoff
- fragmented transcript chunk
- product demo narration
- “another angle” that is really the same thesis again
- good sentence, bad post

### Kill criteria

Kill the idea if it is mostly:

- fragmentary
- mushy
- recap without viewpoint
- repetitive with an already better carousel
- impossible to sharpen into a clear thesis quickly

---

## How the pipeline currently works

### Ingest stage
Implemented mainly in:

```text
scripts/ingest-youtube.ts
```

What it does:

- get official transcript first
- fallback to Whisper-style transcription if needed
- segment transcript
- rank candidate ideas
- reject weak ideas
- build briefs
- generate markdown carousels for surviving ideas

Important brief-selection behavior:

- brief generation should inspect the full viable idea pool (`status !== rejected`), not only the first `published` slots from segment ranking
- reason: a top-ranked segment can still fail overlap/focus gating, and the pipeline should keep looking for later cleaner territory instead of concluding the whole source is empty too early
- if a source still lands on `INFO [no-publishable-briefs]` after that, the remaining bottleneck is upstream claim/segment quality, not brief-seed starvation
- dropped-brief diagnostics now also flag obvious segment-shape residue (`primary segment starts mid-thought` / `ends mid-thought`). If those repeat, stop fiddling with Pages/export/title fallout and inspect chunk boundaries first.

### Important limitation
The automated segment picker is useful, but it is **not perfect**.
It can:

- over-trust transcript fragments
- kill usable ideas for being mid-thought
- over-filter a whole batch to zero
- miss the bigger video thesis

That means the pipeline should be treated as:

**draft generation + filtration + editorial assist**

not as a fully autonomous truth machine.

---

## Variable slide count change

We explicitly patched the generator so draft carousels are **not hard-coded to 5 slides anymore**.

Code area:

```text
scripts/ingest-youtube.ts
```

Current behavior:

- draft generation can flex to different slide counts
- polish/progression logic no longer assumes slide 5 is always the ending

This is intentional and should be preserved.

---

## Theme-sourced carousel behavior

We also explicitly learned that some videos should be sourced from the **whole transcript**, not only top-ranked micro-segments.

Example successful pattern:

Instead of forcing transcript-literal segment carousels, create 3 distinct theme-level posts like:

- category-defining thesis
- practical evaluation framework
- strategic market takeaway

That is often much better than 7 noisy segment-based drafts.

If future operators forget this, quality will drop fast.

---

## Recreating the exact human workflow we used

If you want to recreate the actual working system, do this:

### Step 1: ingest the video

```bash
./content-carousel youtube '<youtube-url>'
```

### Step 2: inspect the source package
Look at:

```text
sources/<source-slug>/summary.md
sources/<source-slug>/ideas.json
sources/<source-slug>/briefs.json
sources/<source-slug>/clean-transcript.md
```

Ask:

- are the surviving ideas actually good?
- are they overlapping?
- did the pipeline produce zero carousels because of over-filtering?
- is there a bigger whole-video thesis hiding in the transcript?

### Step 3: decide sourcing mode

#### Use raw segment output if:
- the generated ideas are already sharp
- the angles are distinct
- transcript chunks are clean enough

#### Use manual/theme-level sourcing if:
- output is zero or near-zero
- ideas overlap too much
- transcript chunks are fragmentary
- the best value lives in the video’s broader themes

### Step 4: edit or write `carousel.md`
For each winning idea, produce real post-ready copy.
Do **not** leave transcript scaffolding pretending to be a finished post.

### Step 5: build Pages

```bash
./content-carousel build-pages
```

### Step 6: commit and push

```bash
git add .
git commit -m "publish <description> carousel batch"
git push
```

### Step 7: wait for Pages deploy to turn green
Check the GitHub Actions Pages workflow.
Only after that send live links.

---

## If something breaks, check these places first

### 1. No carousels published
Look at:

- `sources/<slug>/ideas.json`
- `sources/<slug>/summary.md`

Most likely causes:

- fragment filter too aggressive
- overlap/focus filtering zeroed the batch
- source is transcript-messy and needs theme-level sourcing

### 2. Links 404
Usually one of these:

- Pages deploy failed
- build-critical change was only local and not pushed
- stale assumption that local build == public deploy

### 3. Carousels are weak
Likely causes:

- transcript chunk was intrinsically bad
- segment picker overvalued specificity
- too much transcript literalism
- editorial pass was skipped or too shallow

### 4. Too many similar carousels
Likely causes:

- overlap filter too weak
- operator did not consolidate to top-level distinct theses
- system sourced from many near-identical segments instead of full-video themes

### 5. Preview ordering is weird
The Next.js index now sorts by creation timestamp derived from source package `fetchedAt`.
If ordering is wrong, inspect:

- `lib/carousels.ts`
- `carousels/index.json`
- `sources/<slug>/source.json`

---

## Important files to know

### Pipeline logic

```text
scripts/ingest-youtube.ts
scripts/build-pages.ts
scripts/render-all.ts
scripts/render-carousel.ts
scripts/self-test.ts
scripts/content-carousel.ts
```

### Data loading / indexing

```text
lib/carousels.ts
lib/types.ts
```

### Preview UI

```text
app/page.tsx
app/layout.tsx
components/CarouselSlide.tsx
```

### CLI entrypoint

```text
bin/content-carousel.js
content-carousel
```

---

## GitHub Pages deployment

This repo includes a Pages deployment workflow.

On push to `main`, GitHub Actions should:

1. install dependencies
2. install Playwright Chromium
3. run Pages build
4. upload `out/`
5. deploy to GitHub Pages

If preview links do not work, check the latest Pages action run before doing anything else.

---

## What another operator should not change casually

Do not casually undo these behaviors:

- preserve old outputs by default
- wait for green deploy before sharing links
- variable slide count support
- strong rejection of spec-dump / reference sludge
- preference for non-overlapping carousels
- repo-aware title reservation during generation (new rebuilds should avoid reusing existing carousel/slide titles from other published packages)
- permission to source from full-transcript themes when chunk-level sourcing sucks

Those are not random preferences.
They were learned the hard way.

---

## Blunt summary

This system works best when treated like this:

- the code handles ingestion, structure, preview, rendering, and publishing
- the editorial layer decides what is actually worth posting
- the best batches come from **distinct strategic ideas**, not maximum transcript extraction

If you recreate only the code and forget the editorial rules, you will rebuild a worse version of the system.

If you recreate both the code **and** the editorial rules in this README, you’ll be very close to the actual working setup we built.
