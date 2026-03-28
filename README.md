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
./content-carousel audit-snapshot
./content-carousel cleanup-artifacts
./content-carousel cleanup-artifacts --invalid-sources
./content-carousel cleanup-artifacts --apply
./content-carousel cleanup-artifacts --apply --invalid-sources
./content-carousel inspect-generated-drift
./content-carousel sync-source <source-slug>
./content-carousel build-pages
./content-carousel build-pages --missing-only
```

If you install or link the package as a binary, the same commands are available as `content-carousel ...`.

The existing `pnpm ingest:youtube`, `pnpm render`, `pnpm render:all`, and `pnpm build:pages` scripts still work. They now delegate to the same CLI entrypoint.

`./content-carousel rebuild-source <source-slug>` reuses the source package's stored publish limit by default, so a quick rebuild does not silently fan out from a curated 2-post package to the CLI fallback of 8 posts. You can still override it explicitly with `--max-segments`.

Both `youtube` ingest and `rebuild-source` now invalidate any previously rendered `public/exports/<slug>/` batch for the carousels they rewrite. That keeps stale PNG manifests from pretending they still match the new markdown after thesis/title/slide-count changes; the expected next step is `./content-carousel build-pages` (or `render-all`) to regenerate fresh export bundles.

When repo self-test is clean on content quality but noisy on `missing-export-manifest`, you can now use `./content-carousel build-pages --missing-only` as the lighter repeatability path. It still rebuilds the static site, but the PNG render pass only touches slugs that are currently missing `public/exports/<slug>/manifest.json`, so a fresh agent can close the export backlog without blowing away already-good batches.

`build-pages` now also re-syncs `.pages-serve/<repo>/` **after** the final post-render `next build`, not just before the temporary local render server starts. That matters because the second build can rotate `_next/static/<build-id>/` hashes and route output; without the final re-copy, `.pages-serve/` can lag one build behind `out/` even when the export render itself succeeded.

Title/thesis selection now also strips a small set of weak transcript lead-ins before falling back to reserve titles. Examples: `I know that...`, `I'm describing...`, `Think about what happens when...`, `This is where...`, `If you are in any...`, and `Not because X, but because Y...` are treated as scaffolding, so the generator prefers the actual claim-bearing clause (`because Y`, later full thoughts, or another stronger sentence) instead of publishing the setup phrase as a thesis/title stem.

Brief support recovery is also a bit less brittle now: when the first extraction pass only finds thin clause fragments, the rebuild path tries deterministic adjacent sentence/clause merges before giving up. It now also allows a narrowly-scoped fallback to nearby transcript segments (same source, within a couple segment ordinals) when the winning segment is visibly truncated or too thin on its own. That helps recover support from transcripts where the useful payload is split across neighboring fragments instead of living inside one perfectly self-contained sentence.

There is now one more deterministic rescue tier after that: if a brief is still stuck below two support points, the pipeline decomposes the primary claim / thesis / why-it-matters text into connector-led claim scaffolds (`because`, `which means`, `instead of`, `rather than`, `if`, `when`, `from … to …`) and retries support selection from those cleaner sub-claims. Practical effect: sparse segments are less likely to collapse into `thin-brief-support` just because the transcript packed the real evidence into one long sentence.

That adjacent backfill path is now ranked instead of first-come-first-served: nearby segments get scored for claim quality, overlap with the primary idea, explanatory wording (`because`, `which means`, `instead`, etc.), and obvious banter/episode-intro penalties before they can feed support recovery. So the fallback is less likely to grab a merely-nearby line like `thank you very much` when a stronger explanatory sentence is sitting one segment over.

Support sanitization also now repairs one dumb-but-important transcript artifact: if a usable clause only survives after cleanup as a lowercase fragment (`you're paying...`, `openclaw's memory...`), the brief builder sentence-cases that support candidate before running the weak-line gate. That keeps lead-in stripping from accidentally discarding otherwise valid support just because the first surviving word starts lowercase.

There is now a second boundary-repair layer for the stubborn cases: when a published segment ends mid-thought or a neighboring segment starts lowercase like a continuation fragment, support recovery merges the adjacent windows and re-runs merged-backfill extraction on the combined text. Rebuilds also consider a slightly wider nearby pool (up to 4 segment-adjacent candidates instead of 2) before giving up on support density. Practical effect: transcript chunking accidents are less likely to strand a valid brief at one lonely support point.

Slide-title recovery is now a little less dumb too: during editorial polish, title selection looks at the cleaned slide body before falling all the way back to synthetic reserve titles. So when a brief is thin but the rendered slide body still contains a usable claim sentence, rebuilds can reuse that visible line instead of defaulting straight to `Untitled slide …` placeholders. That sentence cleanup also collapses accidental repeated-word openings (`You're you're ...`) before they can get promoted into published slide titles.

There is also now a pre-reserve salvage tier inside `pickUniqueTitle(...)`: if every polished candidate still fails the normal strong-title gate, the picker will reuse the least-bad non-meta body/brief sentence before it synthesizes another reserve title. Practical effect: some thin rebuilds now surface an obviously-short but source-real line (`here's the thing.`, `never a blank screen.`) instead of collapsing immediately into another duplicate `Untitled slide` or numbered reserve variant.

Fallback title synthesis now also strips inherited reserve junk before retrying (`(2) (2)`, repeated reserve suffix tails) and seeds reserve variants with transcript-specific anchor phrases before the generic suffix ladder. Those anchor phrases are scored across 2-3 token windows and now only qualify when the phrase itself clears a minimum credibility threshold; the generator no longer falls back to single-token anchors for the strategic sentence templates. The anchor gate is also deliberately skeptical of transcript shrapnel now: if a 2-3 token phrase looks like filler (`basically`, `different`, `temporary`, `untitled`, etc.) instead of a real domain phrase, the strategic template path bails out and the generator falls back to safer generic reserve titles. It is also stricter about relational glue words now — phrases built around junk connectors like `toward`, `most`, `matters`, or `even` no longer count as trustworthy reserve anchors. Practical effect: rebuilds are much less likely to publish malformed strategic titles like `Temporary describing makes stale coordination visible.` or `Bottleneck toward operator gets expensive when review stays lazy.` just because a junk phrase looked specific enough.

The final reserve-title escape hatch is deterministic now too. If every title candidate is occupied, rebuilds first try context-qualified reserve variants derived from the current candidate pool/anchor/topic (for example an anchor/topic/emphasis-flavored suffix) before falling all the way back to stable reserved variants like `(2)`, `(3)`, or `(reserve)`. That matters because fallback title collisions should reveal a real editorial/brief-density problem — not create different visible output on each rebuild just because the clock changed.

That context-qualified branch is also more skeptical of junk qualifiers now. Reserve-context labels are sanitized against the base title stem, strip filler connectors (`around`, `where`, `when`, etc.), and must still look like credible anchor phrases before they can appear in a fallback title. Practical effect: the generator is less likely to publish self-echoing labels like `Around Leverage around.` just because the fallback candidate pool fed its own reserve sentence back into the qualifier picker.

It is also stricter about **comparative/adjective junk** in those labels now. Context phrases like `clearer checkpoint`, `lowest latency`, `zero translation`, `triaging attention`, or any two-word label that still ends in a weak singleton (`checkpoint`, `review`, `operator`, etc.) are filtered out before the emergency reserve templates can publish them. The label gate is now stricter structurally too: 3-word labels have to carry at least two genuinely strong/domain tokens, cannot start on a weak singleton stem, and cannot hide a flimsy middle token between two decent nouns. Practical effect: rebuilds should surface more honest generic fallback titles instead of weird half-specific phrases like `... gets expensive when review stays lazy.` or `Checkpoint team redesign ...`.

Deterministic reserve fallback is now more context-first too. Before dropping to numbered variants like `(11)` or `(17)`, the picker tries extra label-led titles such as `<label> exposes where the old workflow breaks.`, `<label> is becoming the operating bottleneck.`, and `<label> forces a clearer human checkpoint.` It also tries a couple topic/emphasis-led variants in that same tier. Practical effect: thin rebuilds are much less likely to spray a whole source package with the same numbered reserve sentence when there is still enough context to mint distinct fallback titles.

The higher-risk **strategic reserve** templates are stricter now too. Anchor phrases must clear the same reserve-context sanitization gate before the generator is allowed to publish templates like `... gets expensive when review stays lazy.` or `... makes stale coordination visible.` Practical effect: transcript junk like `Leverage smarter audit` / `Triaging attention real` no longer slips through just because it was unique enough to satisfy the reservation set.

There is also now an emergency distinct-title tier under that reserve path: if the usual context-qualified variants are exhausted, the generator tries one more pass built from surviving context labels / named anchors before it gives up and reuses an already-blocked reserve title. Practical effect: thin rebuilds are less likely to emit exact duplicate fallback slide titles inside the same source cluster just because every nicer candidate was already reserved.

Carousel title picking is reservation-aware now as well. `titleBaseFromSlides(...)` no longer blindly promotes the first decent-looking slide title into frontmatter if that exact title is already reserved elsewhere in the repo audit set. When every obvious slide title is already taken, it synthesizes a distinct fallback instead of reintroducing a repo-level duplicate carousel title from the slide layer.

There is now one more safeguard above that slide-level picker: when a carousel's surviving slide titles are mostly synthetic reserve output, the frontmatter title path falls back to brief/body-derived claims before it accepts another reserve sentence as the carousel title. Practical effect: thin sources can still have weak slide headlines, but they are less likely to ship two different carousels with the same fallback frontmatter title just because the slide layer collapsed first.

Editorial polish is also more willing to retry title extraction from the cleaned title/body/brief lines before it accepts synthetic reserve phrasing as "good enough." In practice that means two things: (1) reserve-template endings like `changes where human judgment belongs` / `changes what human review is for` / `stale workflows break first` are now treated as synthetic fallback output instead of real editorial wins, and (2) the final title picker now re-runs `titleFromSentence(...)` across the surviving slide/body/brief candidates before it gives up. Practical effect: thin rebuilds are more likely to recover a source-shaped title and less likely to ship duplicate synthetic carousel titles just because the first pass collapsed into checkpoint-flavored reserve text.

Title reservation is now also **final-output scoped** instead of draft-scoped during batch rebuilds. `buildCarousel(...)` and the rewrite/editorial-polish pass each get a fresh copy of the already-published reservation set, and only the finalized carousel commits its frontmatter + slide titles back into the batch-global pool. Practical effect: a rewrite pass can keep/recover the same strong title candidates it just surfaced in draft form instead of blocking itself and collapsing into `Untitled slide` / duplicate reserve sludge.

`./content-carousel sync-source <source-slug>` is the lightweight repair path when `ideas.json` / `briefs.json` / surviving `carousel.md` files are the canonical truth but `source.json` drifted after dropped segments or partial cleanup. It rewrites `source.json`, regenerates `summary.md`, and demotes orphaned `published` ideas whose markdown no longer exists.

`./content-carousel audit-snapshot` is the repo-level continuity path for hourly reviews. It runs `self-test --repo --json`, writes a timestamped JSON + markdown snapshot into `docs/audit-history/`, refreshes `docs/audit-history/latest.json`, and includes a diff versus the prior snapshot so a fresh agent can see what actually changed instead of re-parsing a wall of warnings from scratch. When the repo audit includes `generated-artifact-git-drift`, the snapshot now also captures the current `inspect-generated-drift` verdict (Pages mirror `MATCH` vs `DRIFT`, dirty generated roots, and the top dirty route groups/slugs inside those roots) **and** summarizes whether those dirty roots materially changed versus the prior snapshot. Route-group summaries now collapse paired route files like `index.html` + `index.txt` into one logical route change and preserve status mix (`M`, `??`, `D`) per slug, so the next agent can tell the difference between "same expected post-build dirt" and "new slug/untracked/deleted drift scope" without rerunning the triage by hand after context reset. The drift helper/snapshot also now surfaces a status-led view (`??`, `D`, `M`) of the top affected route groups, which makes genuinely interesting publish churn pop out faster than one mixed slug list.

The CLI bundle now keeps those responsibilities separated on purpose: `self-test --json` and `cleanup-artifacts --json` stay machine-readable, and `audit-snapshot` only runs when you explicitly call it. That matters for repeatability because piping JSON into other checks should not silently append a second snapshot payload just because the CLI imports the snapshot helper.

`./content-carousel cleanup-artifacts` is the deliberate stale-artifact cleanup path. Dry-run mode lists unreferenced directories across `carousels/`, `public/exports/`, `.next/server/app/carousel/`, `.pages-serve/<repo>/carousel/`, and `out/carousel/`. Add `--apply` to actually delete those leftovers and refresh `carousels/index.json`. Add `--invalid-sources` when you also want cleanup to surface/remove stray `sources/<slug>/` directories that never got a `source.json` manifest (the same class of problem repo self-test reports as `invalid-source-package`).

Repo self-test now also surfaces `generated-artifact-git-drift` as a staging/Pages continuity note when tracked generated outputs under `.pages-serve/`, `public/exports/`, `out/`, or `.next/` are dirty in git. That check is intentionally separate from stale-directory cleanup: it catches the more annoying case where the directory still belongs to a live slug, but the saved generated files are out of sync with the current rebuild and will leave the repo looking half-regenerated after a Pages pass.

`./content-carousel inspect-generated-drift` is the follow-up when that note appears. It groups git-dirty generated files by root/target, now also breaks the worst buckets down by live route group/slug (`carousel/<slug>`, `exports/<slug>`, etc.), collapses paired route files like `index.html` + `index.txt` into one logical route count, preserves the per-slug status mix (`M`, `??`, `D`), and adds a status-led route-group view so new/deleted publish churn is easy to spot separately from boring modified routes. Root pages like `index` and `404` are also collapsed into logical route groups now instead of showing html/txt siblings as separate noise. Then it does the important continuity check directly: is `.pages-serve/<repo>/` actually a byte-for-byte mirror of `out/`, or is the repo just dirty because regenerated Pages output has not been committed yet? Practical effect: a fresh agent can distinguish “expected post-build dirt” from “staging tree still out of sync” **and** see which published slugs are driving the dirt without manually scraping `git status`.

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
8. defaults those generated carousels toward **5-8 slides** with **5 as the default gravity**, expanding to **6-7 only when extra slides add distinct structural beats rather than more explanation**; the copy rhythm stays **concise but complete**: usually **1-3 short lines per slide**, but with room for an extra sentence or two when clarity/payoff would otherwise get lost (and splitting list-y ideas into more slides when possible)
9. removes superseded carousel/export artifacts from earlier ingests of the same source
10. refreshes `carousels/index.json` as a generated compatibility artifact

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
- `./content-carousel self-test <source-slug>` is the quickest repeatability check after ingest/rebuild/render. It audits source.json ↔ ideas.json consistency, brief quality/overlap, weak/duplicate titles, fallback-title residue (`synthetic-slide-title` / `synthetic-carousel-title`), and export drift before you bother publishing.
- If a source-level self-test flags stale brief/title drift after upstream heuristic changes, run `./content-carousel rebuild-source <source-slug>` before assuming the code path is still broken. That command rewrites `briefs.json`, `source.json`, markdown carousels, and summary artifacts from the current heuristics, which is often enough to clear old overlap/title drift without any new code patch.
- `./content-carousel self-test --repo` is the repo-wide repeatability sweep. It runs every source audit, then checks cross-package duplicate carousel/slide titles plus stale `carousels/`, `public/exports/`, and `.next/server/app/carousel/` residue.
- Duplicate title checks are now punctuation-tolerant on purpose. A slide titled `...expect.` and another titled `...expect` count as the same editorial title, because that kind of drift still creates overlapping output even when the only difference is a trailing period or quote.
- Repo self-test now degrades gracefully when `sources/<slug>/` contains a stray/incomplete package (for example a directory without `source.json`). Instead of crashing the whole audit run, it emits `invalid-source-package` for that slug so the hourly review can keep going and show the real repo state.
- A source package with an intentionally empty `briefs.json` is no longer treated as a warning by itself. If `source.json` also shows zero published ideas / zero published carousels, self-test treats that package as clean instead of noisy.
- Self-test also now emits `malformed-synthetic-title` when a fallback title is syntactically unique but still obviously broken — e.g. repeated-token junk like `Checkpoint checkpoint` / `What what`, or singleton reserve-context labels like `around expectation` / `where operator judgment`. Treat those as generator-shape bugs, not just generic title weakness.
- The title audit is now stricter about **actual reserve suffix shapes** too. It only flags suffix-ladder residue when the fallback phrase is the ending itself (for example `— in production.` / `— under real load.`), not when a normal source-real sentence merely contains those words (`... in production deployments`). Practical effect: repo triage stays focused on generator sludge instead of false-positive real titles.
- `./content-carousel cleanup-artifacts` is the boring repair follow-up after repo self-test. Use it in dry-run mode first to inspect stale artifact scope, then `--apply` when you intentionally want repo state to match currently referenced source packages.
- If repo self-test reports `invalid-source-package`, run `./content-carousel cleanup-artifacts --invalid-sources` first. That dry run shows whether the problem is just a stray `sources/<slug>/` directory with no `source.json`; add `--apply --invalid-sources` only when you intentionally want to prune those broken source folders.
- If repo self-test reports `generated-artifact-git-drift`, run `./content-carousel inspect-generated-drift` next. That helper answers the staging continuity question quickly: “is `.pages-serve/<repo>/` actually out of sync with `out/`, or is git merely dirty because we rebuilt generated files?”
- Add `--json` when you want to persist the audit result, diff hourly runs, or hand the same issue set to another agent without scraping console text.
- `pnpm inspect:title-hotspots` is the faster repo-wide triage pass when the audit says title quality is the current bottleneck. It reruns `self-test --repo --json`, filters to title-only issue families (`synthetic-*`, `weak-*`, duplicate-title, malformed-synthetic-title), then groups them by code + carousel slug so a fresh agent can jump straight to the ugliest title batches instead of re-skimming every export warning.
- You can also aim that hotspot helper at one package: `pnpm exec tsx scripts/inspect-title-hotspots.ts <source-slug>`.
- `pnpm inspect:source-titles <source-slug>` is the next drill-down step after that. It reruns `self-test <source-slug> --json`, joins the failing issue lines back to `briefs.json` + live `carousel.md`, and prints the exact brief thesis/why/support inputs beside the current frontmatter + slide titles for each affected carousel. Use it when you need to answer: “did the brief have usable title material, or did the picker honestly have nothing?” without hand-opening five files every hour.
- `pnpm audit:snapshot` is the boring hourly-review helper: it runs the repo JSON audit, writes a timestamped snapshot under `docs/audit-history/`, refreshes `docs/audit-history/latest.json`, records an added/removed issue diff against the previous snapshot, and now also summarizes the top issue codes + source-package hotspots so a fresh agent can see what changed and where to look first.
- Missing markdown refs are now triaged more explicitly: the self-test tells you whether the slug still has leftover export artifacts or whether the source manifest points at a slug with no local artifacts at all (usually a dropped segment that never got cleaned out of `source.json`).
- When that orphaned-manifest state is real, `./content-carousel sync-source <source-slug>` is now the deliberate repair path. It keeps surviving briefs/carousels, rewrites `source.json`, refreshes `summary.md`, and demotes stale `published` ideas in `ideas.json` so self-test stops reporting fake publication drift.
- Use `./content-carousel self-test <source-slug> --strict-global` only when you intentionally want to compare one source package against the rest of the workspace. The default source check assumes preserving older batches is normal.
- `pnpm exec tsx scripts/self-test.ts <source-slug>` now works too when you want to iterate on the audit logic directly without going through the bundled CLI.
- In the current operator workflow, a newly supplied video link should usually be treated as an implicit request to generate a fresh preview batch from that source, not as a prompt for another round of clarification.
- Preserve existing preview batches by default. Only wipe/delete old previews when the user explicitly asks for replacement or cleanup.
- If you add a carousel and want it public, it still needs to be committed and pushed to `main`. Pages is public, not magical.
