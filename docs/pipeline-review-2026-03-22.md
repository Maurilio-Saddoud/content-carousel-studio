# Pipeline review — 2026-03-22

## What changed

- Added `content-carousel self-test <source-slug>` as a first-class CLI path.
- Fixed `content-carousel rebuild-source <source-slug>` to preserve the source package's stored publish limit by default instead of silently expanding back to the CLI fallback of 8 posts.
- Added an explicit brief-promotion stage: published ideas now also produce `sources/<source-slug>/briefs.json` before carousels are generated.
- Carousel generation now reads thesis / audience / why-it-matters / support points from briefs instead of treating raw ranked segments as the direct publishing unit.
- Added first-pass set-aware support allocation so multiple briefs are less likely to reuse the exact same support lines.
- Fixed render isolation so slide cards clip overflow instead of allowing page content to paint outside the frame.
- Tightened `render` failure behavior so it now errors when a target page produces zero `.carousel-slide` elements instead of silently claiming success with empty output.
- Self-test audits:
  - `source.json` vs `ideas.json` published-id consistency
  - weak brief thesis / why-it-matters / support lines in `briefs.json`
  - overlapping brief territory across the same source package
  - weak carousel titles
  - weak slide titles
  - duplicate carousel titles
  - duplicate slide titles
  - missing export manifests
  - slide-count vs PNG-count mismatches
  - stale `public/exports/*` directories relative to the current source package
- `scripts/self-test.ts` is directly runnable now (`pnpm exec tsx scripts/self-test.ts <source-slug>`) in addition to the bundled `./content-carousel self-test <source-slug>` path.
- Tightened opening-title selection during ingest/rebuild so obviously weak first-slide titles like fragmentary openers or filler lines are less likely to become the carousel title.

## Why

The repo already had ingest/rebuild/render/build paths, but no cheap inspection path for repeatability. That made it easy to regenerate assets without noticing title quality drift, stale exports, or package/index mismatch.

A concrete repeatability bug also showed up during the hourly review: `rebuild-source` was defaulting back to 8 posts unless the operator remembered `--max-segments`, which means a safe rebuild of a curated 2-post source package could unexpectedly publish 7-8 carousels and create misleading self-test noise. Rebuilds now inherit the stored package limit first.

## How to use now

1. Ingest or rebuild a source package.
2. Run `./content-carousel self-test <source-slug>`.
3. Fix anything noisy before `render-all` / `build-pages` / publish.

## Operator expectation update

For this workflow, when the user sends a **new video link** after discussing carousel generation, treat it as an implicit request to:
- generate a fresh batch from that video
- keep the post count low (default 2 strong posts unless the user says otherwise)
- optimize for low overlap / high signal
- rebuild and publish Pages
- preserve existing previews by default

Only wipe/delete existing previews if the user explicitly asks for replacement or cleanup.

Do **not** bounce back with "if you want me to run it, say run it" unless the user was genuinely ambiguous.

## Current finding on the existing sample package

The existing source package still produces some weak slide titles/openers. The self-test now surfaces that explicitly instead of hiding it in generated markdown.

A second pass tightened later-slide title selection to prefer primary-segment thoughts before shared companion/support lines. That reduced warning volume, but did **not** fully solve repetition because multiple published carousels still draw from the same small set of transcript claims and fallback takeaways.

A later pass introduced explicit briefs plus set-aware support allocation. That improved the internal structure of the source package and reduced some support duplication, but the sample still shows clear overlap in slide titles because the current briefing logic is still heuristic and transcript-led.

## Current findings after the latest self-test pass

The new brief-level audit confirms the real weak point is still upstream of carousel markdown:

- `why-every-ai-skill-you-learned-6-months-ago-is-already-wrong-and-what-is-replaci`
  - both published briefs still contain transcript-fragment thesis/why lines like "I've seen two structures emerging here that are significant, right?"
  - brief support still leaks filler/generic scaffolding like "The first is a team of one."
- `4-000-people-lost-their-jobs-at-block-dorsey-blamed-ai-here-s-what-actually-happ`
  - the two published briefs now trigger an explicit `brief-overlap` warning (57% normalized claim-vocabulary overlap)
  - weak lines like "I'm going to get into why it's good news." and "We are going to move to this world." are still entering briefs before carousel generation

## Likely next improvement

Move from heuristic brief construction to **claim clustering + set-aware brief selection** across the full source package.

Concretely:
- create explicit claim records instead of treating published ideas as the only brief inputs
- cluster related claims into themes before any brief is promoted
- reserve thesis/support/title territory already claimed by earlier selected briefs in the same rebuild
- demote generic fallback lines like "The edge is keeping your operating model current"
- add a stronger fragment filter for clause-style openers like "For a product manager,"

That should attack the real remaining problem: cross-carousel repetition at the thesis/claim level, not just single-carousel phrasing.
