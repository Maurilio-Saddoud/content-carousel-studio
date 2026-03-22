# Pipeline review — 2026-03-22

## What changed

- Added `content-carousel self-test <source-slug>` as a first-class CLI path.
- Added an explicit brief-promotion stage: published ideas now also produce `sources/<source-slug>/briefs.json` before carousels are generated.
- Carousel generation now reads thesis / audience / why-it-matters / support points from briefs instead of treating raw ranked segments as the direct publishing unit.
- Added first-pass set-aware support allocation so multiple briefs are less likely to reuse the exact same support lines.
- Fixed render isolation so slide cards clip overflow instead of allowing page content to paint outside the frame.
- Tightened `render` failure behavior so it now errors when a target page produces zero `.carousel-slide` elements instead of silently claiming success with empty output.
- Self-test audits:
  - `source.json` vs `ideas.json` published-id consistency
  - weak carousel titles
  - weak slide titles
  - duplicate carousel titles
  - duplicate slide titles
  - missing export manifests
  - slide-count vs PNG-count mismatches
  - stale `public/exports/*` directories relative to the current source package
- Tightened opening-title selection during ingest/rebuild so obviously weak first-slide titles like fragmentary openers or filler lines are less likely to become the carousel title.

## Why

The repo already had ingest/rebuild/render/build paths, but no cheap inspection path for repeatability. That made it easy to regenerate assets without noticing title quality drift, stale exports, or package/index mismatch.

## How to use now

1. Ingest or rebuild a source package.
2. Run `./content-carousel self-test <source-slug>`.
3. Fix anything noisy before `render-all` / `build-pages` / publish.

## Current finding on the existing sample package

The existing source package still produces some weak slide titles/openers. The self-test now surfaces that explicitly instead of hiding it in generated markdown.

A second pass tightened later-slide title selection to prefer primary-segment thoughts before shared companion/support lines. That reduced warning volume, but did **not** fully solve repetition because multiple published carousels still draw from the same small set of transcript claims and fallback takeaways.

A later pass introduced explicit briefs plus set-aware support allocation. That improved the internal structure of the source package and reduced some support duplication, but the sample still shows clear overlap in slide titles because the current briefing logic is still heuristic and transcript-led.

## Likely next improvement

Move from heuristic brief construction to **claim clustering + set-aware brief selection** across the full source package.

Concretely:
- create explicit claim records instead of treating published ideas as the only brief inputs
- cluster related claims into themes before any brief is promoted
- reserve thesis/support/title territory already claimed by earlier selected briefs in the same rebuild
- demote generic fallback lines like "The edge is keeping your operating model current"
- add a stronger fragment filter for clause-style openers like "For a product manager,"

That should attack the real remaining problem: cross-carousel repetition at the thesis/claim level, not just single-carousel phrasing.
