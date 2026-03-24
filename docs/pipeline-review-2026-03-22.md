# Pipeline review — 2026-03-22

## Latest follow-up pass: fragment-sanitized brief candidate extraction

Another repeatability issue showed up in the brief builder: rebuilds were still over-trusting raw transcript sentence boundaries, so segments that began or ended mid-thought could promote bad full-blob thesis/why lines like `I'm describing is going to be temporary...` or leave a brief with almost no usable support.

### What changed

- added a shared `extractEditorialFragments()` helper in `scripts/ingest-youtube.ts`
- that helper builds a ranked pool from the raw chunk, sentence splits, and clause splits, then filters out weak/meta/lowercase-tail fragments before brief selection
- thesis selection now consults that fragment-sanitized pool before falling back to the older hook/titleSuggestion/sentence candidates
- why-it-matters selection now uses the same sanitized pool across the primary + supporting ideas
- support-point sanitization now reuses the same helper so thesis/why/support all pull from one consistent cleanup path instead of three slightly different heuristics

### What this improved

- some fragment-heavy theses now promote cleaner internal claim fragments instead of blindly reusing the whole transcript blob
- the builder is more consistent about how it treats sentence-vs-clause candidates across thesis / why / support selection
- rebuild behavior is easier to reason about because the same filtering rules now drive all three brief fields

### What it did **not** fix yet

This did **not** eliminate the remaining noisy `thin-brief-support` cases on the two stubborn sample packages.

Those packages still expose the next real weakness clearly:
- some accepted source segments are just too truncated / blob-like to yield 2+ clean support lines after sanitation
- the next improvement is likely earlier segment shaping or explicit "do not publish this brief if it cannot sustain support" gating, not more title fallback work

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
  - stale `.pages-serve/<repo>/carousel/*` preview routes when using `--strict-global`
  - stale `out/carousel/*` static routes when using `--strict-global`
- `scripts/self-test.ts` is directly runnable now (`pnpm exec tsx scripts/self-test.ts <source-slug>`) in addition to the bundled `./content-carousel self-test <source-slug>` path.
- Tightened opening-title selection during ingest/rebuild so obviously weak first-slide titles like fragmentary openers or filler lines are less likely to become the carousel title.

## Why

The repo already had ingest/rebuild/render/build paths, but no cheap inspection path for repeatability. That made it easy to regenerate assets without noticing title quality drift, stale exports, or package/index mismatch.

A concrete repeatability bug also showed up during the hourly review: `rebuild-source` was defaulting back to 8 posts unless the operator remembered `--max-segments`, which means a safe rebuild of a curated 2-post source package could unexpectedly publish 7-8 carousels and create misleading self-test noise. Rebuilds now inherit the stored package limit first.

## How to use now

1. Ingest or rebuild a source package.
2. Run `./content-carousel self-test <source-slug>`.
3. After `build-pages`, run `./content-carousel self-test <source-slug> --strict-global` if you want the audit to also inspect repo-wide preview/static route drift under `.pages-serve/` and `out/`.
4. Fix anything noisy before publish.

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

Another hardening pass now rejects new briefs when they overlap too heavily with an already-accepted brief in the same batch. The goal is simple: prefer shipping one strong post over two samey ones.

## Current findings after the latest self-test pass

The new brief-level audit confirms the real weak point is still upstream of carousel markdown:

- `why-every-ai-skill-you-learned-6-months-ago-is-already-wrong-and-what-is-replaci`
  - both published briefs still contain transcript-fragment thesis/why lines like "I've seen two structures emerging here that are significant, right?"
  - brief support still leaks filler/generic scaffolding like "The first is a team of one."
- `4-000-people-lost-their-jobs-at-block-dorsey-blamed-ai-here-s-what-actually-happ`
  - the two published briefs now trigger an explicit `brief-overlap` warning (57% normalized claim-vocabulary overlap)
  - weak lines like "I'm going to get into why it's good news." and "We are going to move to this world." are still entering briefs before carousel generation

## Follow-up pass: brief-territory reservation

A later hourly pass tightened the brief builder itself instead of only the self-test.

### What changed

- brief construction now reserves **why-it-matters** lines across the batch instead of letting multiple briefs reuse the same strongest sentence
- support-idea selection now prefers fresh candidate segments before reusing ones already claimed by an earlier brief
- support-point selection now excludes the chosen thesis/why lines so a brief is less likely to repeat itself immediately
- sentence cleanup now strips leading discourse filler like `so`, `well`, and `really,` before title/thesis evaluation
- fallback brief generation was updated to use the same reserved thesis/why/support pipeline as normal briefs

### What this fixed

The two noisy sample packages that had been showing overlap are now clean on the built-in audit path:

- `./content-carousel self-test 4-000-people-lost-their-jobs-at-block-dorsey-blamed-ai-here-s-what-actually-happ`
- `./content-carousel self-test why-every-ai-skill-you-learned-6-months-ago-is-already-wrong-and-what-is-replaci`

Both now return `INFO [clean] No obvious source/markdown/export drift detected.` after rebuild.

### Why it matters

This is still heuristic, but it pushes the pipeline one step upstream:
- the repo no longer relies on self-test warnings alone to catch repeated `why it matters` territory
- weak transcript-style openers are less likely to survive into theses/titles unchanged
- distinct briefs now start from distinct claim territory more often, which reduces duplicate slide titles downstream

## Latest follow-up pass: staging/static-route drift audit

Another repeatability hole showed up in the Pages flow: the self-test already checked `public/exports/*`, but it did **not** inspect the actual staging/static route trees that `build-pages` produces.

That meant a fresh agent could rebuild previews, look at `.pages-serve/` or `out/`, and still miss stale carousel routes left behind from an earlier build unless they manually diffed directory trees.

### What changed

- `self-test --strict-global` now also inspects:
  - `.pages-serve/<repo>/carousel/*`
  - `out/carousel/*`
- any route directory that exists there but is **not** part of the current source package is now surfaced as an explicit info-level stale-artifact warning
- repo-name resolution matches the Pages build behavior (`GITHUB_REPOSITORY` repo name fallback → `content-carousel-studio`)

### Why it matters

This closes the audit gap between:
- generated markdown in `carousels/`
- exported PNG bundles in `public/exports/`
- Pages preview/static outputs in `.pages-serve/` and `out/`

So the same self-test path can now catch stale artifacts across the whole publish chain instead of only the markdown/export half.

## Latest follow-up pass: self-test missing-artifact hardening

Another repeatability hole showed up in the source-package audit itself: if `source.json` referenced a carousel slug whose `carousels/<slug>/carousel.md` file no longer existed, `self-test` crashed with an `ENOENT` stack trace instead of producing a usable diagnosis.

That is exactly the kind of failure that makes handoffs brittle. A fresh agent should get a crisp audit result, not a repo-internals exception.

### What changed

- `scripts/self-test.ts` now treats missing referenced carousel markdown as an explicit audit finding instead of a fatal crash
- the new audit code is `missing-carousel-markdown`
- the error message points back to the broken source-package reference and tells the operator to rebuild before trusting downstream Pages/export artifacts
- README + local skill docs were updated so future runs know this is now part of the expected audit behavior

### What this fixed

The broken package below no longer aborts the review path:

- `ai-classrooms-self-evolving-ai-nvidia-gtc-ai-for-polymarket-google-app-builder-a`

Instead of a stack trace, self-test now reports the missing slug cleanly and continues the rest of the audit.

### Why it matters

This makes the inspection path resilient to one of the most common state-drift problems in this repo shape:
- `source.json` says a carousel exists
- the carousel directory or markdown file is gone
- Pages/static/export state may still partially exist and look deceptively valid

Catching that as structured audit output is much safer than letting the review tool die halfway through.

## Latest follow-up pass: support-point backfill hardening

Another repeatability issue showed up in the brief layer itself: some rebuilt packages were producing structurally thin briefs with **0-1 support points**, which then cascaded into weak slide scaffolding and noisy self-test output.

### What changed

- `buildSupportPoints()` now does a second pass when the strict sentence-level candidate pool would leave a brief under-supported
- the fallback pool is clause-based, but still filtered through cleanup + reserved-thesis/why checks
- backfill lines are rejected if they are too short, question-shaped, or obviously discourse-heavy (`I'm...`, `we are...`, `this is where...`, etc.)
- duplicate suppression now also checks overlap against already-selected support points before accepting fallback lines

### What this fixed

- the noisy Block package no longer emits `thin-brief-support` warnings after rebuild
- support selection is less brittle when a transcript segment only has one strong full sentence but still contains clause-level material worth turning into support

### What it did **not** fix

This pass improves structural completeness, not semantic elegance.

The same package still shows weak support/title duplication because the remaining problem is upstream: some accepted claim territory is still too transcript-y or too generic before briefing starts.

## Latest follow-up pass: source-manifest title sync

Another handoff problem showed up in the publish chain: `carousel.md` is supposed to be the user-facing source of truth, but `sources/<source-slug>/source.json` could still keep an older title after a manual polish pass.

That created noisy `source-title-drift` self-test warnings even when the markdown carousel itself was correct.

### What changed

- `syncCarouselDirectoryIndex()` now loads the current markdown carousels first, writes `carousels/index.json`, and then backfills matching `sources/*/source.json` carousel entries from those markdown files
- synced fields are:
  - `title`
  - `previewPath`
  - `carouselPath`
- this means an index sync or rebuild now repairs stale source-manifest carousel metadata instead of leaving the source package half-updated

### What this fixed

- the prior `source-title-drift` warning on:
  - `claude-code-wiped-2-5-years-of-data-the-engineer-who-built-it-couldn-t-stop-it`
- after rebuild, that package no longer reports source-manifest title drift because the source package now gets refreshed from the markdown title during index sync

### Why it matters

This closes another repeatability gap in the chain:
- `carousel.md` stays the editable truth
- `carousels/index.json` stays in sync for app/pages loading
- `sources/<source-slug>/source.json` no longer quietly lags behind after a title polish

So a fresh agent can trust the package metadata more when auditing or handing off a batch.

## Latest follow-up pass: transcript-meta support sanitization

Another repeatability leak showed up in the claude-code package: even after overlap hardening, the fallback brief builder could still admit transcript-meta lines like `This is a video about...` or `This is not about learning to code.` as support/title material when the underlying transcript chunk arrived as one long blob.

### What changed

- `isWeakDisplayLine()` / `isWeakBriefLineCandidate()` now reject a small class of transcript-meta narration lines (`this is a video about...`, `in this video...`, `that is the skill of 2026`, etc.)
- clause splitting now also breaks on sentence punctuation during fallback support recovery instead of only commas/dashes
- support-point construction now runs every candidate through a small sanitization pass that:
  - prefers a cleaner sentence/fragment over the whole transcript blob
  - drops transcript-meta narration before selection
  - still respects support reuse + overlap suppression
- self-test now uses the same transcript-meta heuristics so audits catch the same class of weak copy the generator is trying to avoid

### What this fixed

- the claude-code sample no longer promotes giant transcript blobs like:
  - `Maybe you have hours of work lost ... This is all about that. This is not about learning to code...`
- weak-meta support warnings were reduced to a cleaner structural diagnosis (`thin-brief-support`) when the source simply does not have enough distinct support left after cleanup
- the two already-clean sample packages stayed clean on `self-test`, so the tighter filters did not regress the healthier cases

### What it did **not** fix

This did **not** solve all duplicate-title drift in the claude package.

What remains there is more semantic than syntactic:
- too many accepted briefs are still drawing from the same limited claim territory
- some fallback slide titles still converge on generic lines like `The edge is keeping your operating model current.`

So the next improvement is still upstream distinctness, not another regex band-aid.

## Latest follow-up pass: companion-thought isolation fix

Another repeatability leak turned out to be a straight-up implementation bug, not just weak heuristics.

### What changed

- `buildCarousel()` was incorrectly building `companionSegments` with:
  - `brief.supportingIdeaIds.includes(idea.id) || idea.id !== primary.id`
- that condition effectively admitted **every non-primary idea in the source package** into the companion pool
- the builder now limits companion material to the brief's actual `supportingIdeaIds`

### What this fixed

- later slides are less likely to inherit claim/title material from unrelated ideas in the same source package
- duplicate fallback titles should drop because each carousel now draws from its own reserved support territory instead of the entire batch
- this makes the brief layer actually matter: the selected supporting ideas now constrain the downstream carousel copy like they were supposed to

### Why it matters

This closes a nasty handoff gap between:
- distinct brief selection upstream
- non-overlapping slide generation downstream

Before this fix, the system could do the right thing in `briefs.json` and then quietly smear all the other ideas back into the finished carousel anyway.

That kind of bug makes the repo feel non-deterministic to a fresh agent because the artifact chain says “these are the selected supports” while the generated markdown is secretly using a much larger pool.

## Latest follow-up pass: stale Pages/static route cleanup during rebuild

Another repeatability gap was sitting between source-package cleanup and the Pages/staging outputs.

`removeStalePublishedArtifacts()` already deleted dropped slugs from:
- `carousels/<slug>`
- `public/exports/<slug>`

But it left the matching route directories behind in:
- `.pages-serve/<repo>/carousel/<slug>`
- `out/carousel/<slug>`

So a rebuild could correctly narrow the published set while local preview/static artifacts still made old routes look alive until a later full Pages rebuild or manual cleanup.

### What changed

- stale-slug cleanup now also removes matching route folders from `.pages-serve/` and `out/`
- repo-name resolution matches the self-test/build-pages fallback (`GITHUB_REPOSITORY` repo name fallback → `content-carousel-studio`)
- this means a source rebuild is now more self-contained: dropped slugs are removed across markdown, PNG export, preview staging, and static-route layers in one pass

### Why it matters

This tightens the handoff path for a fresh agent:
- `source.json` can drop an old carousel
- the filesystem now drops the matching preview/static route too
- `self-test --strict-global` becomes a verification step instead of the only thing noticing that staging still had ghosts

That makes the repo feel less stateful and less dependent on knowing which directories are safe to manually blow away.

## Latest follow-up pass: batch-wide slide-title reservation

Another repeatability leak was still showing up even after the brief/support work hardened: multiple carousels in the **same source package** could still converge on the same slide-5 title because late-stage fallback logic kept reusing stock phrases.

### What changed

- `buildCarouselBundles()` now carries a package-level `usedBatchTitles` set across the whole rebuild instead of letting each carousel title itself in isolation
- `pickUniqueTitle()` now honors that batch-level reservation set, so later carousels have to look for a different viable title before reusing one already claimed upstream in the same package
- closing-slide fallback logic now prefers a deterministic pool of review/oversight-oriented reserve titles instead of a single hard-coded line like `The edge is keeping your operating model current.`
- `extractTakeaway()` no longer injects that same stock operating-model sentence when the transcript did not actually supply a usable takeaway
- closing-slide progression now re-checks earlier slide titles before finalizing slide 5, so one carousel is less likely to repeat its own opener or framework title at the finish

### What this fixed

On rebuild, the claude-code sample package dropped from noisy duplicate-title drift to only the two remaining structural warnings that are genuinely upstream:

- `./content-carousel self-test claude-code-wiped-2-5-years-of-data-the-engineer-who-built-it-couldn-t-stop-it`
  - before: repeated package-wide duplicate slide-5 titles driven by generic fallback copy
  - now: only
    - `thin-brief-support` on `brief-segment-05`
    - `missing-export-manifest` for the not-yet-rendered slug

### Why it matters

This closes another handoff gap between:
- brief distinctness upstream
- slide-title selection mid-pipeline
- self-test title audits downstream

Before this pass, the repo could do decent brief separation and then quietly collapse several endings back into the same fallback sentence anyway.

A fresh agent reviewing `briefs.json` plus `carousel.md` would reasonably think the pipeline was ignoring its own brief distinctions. Now the title-selection layer respects batch context more explicitly.

## Latest follow-up pass: editorial claim-candidate ordering

Another repeatability leak was still showing up in the brief layer: even when a segment contained a usable claim later in the transcript chunk, thesis / why / support selection still leaned too hard on transcript order and kept promoting discourse-wrapper lines like `Thank you very much.`, `I'm describing is going to be temporary.`, or `I know that there are many interstitial states.`

### What changed

- added a shared editorial line scorer for brief-field selection
- thesis / why-it-matters / support-point candidate pools are now sorted by that score before selection
- the scorer rewards concrete operator/payoff language (`workflow`, `team`, `customer value`, `review`, `coordination`, etc.) and penalizes transcript-wrapper phrasing, gratitude/signoff language, and first-person scene-setting openers
- this keeps later strong sentences in the same segment eligible to beat the weak first sentence instead of inheriting transcript order by default

### What this fixed

A rebuild of the previously noisy `why-every-ai-skill-you-learned-6-months-ago-is-already-wrong-and-what-is-replaci` sample dropped from 21 warnings to 5 on `self-test`.

The biggest wins were upstream:
- the prior `source-title-drift` warnings disappeared after rebuild because stronger thesis selection now aligns better with the polished markdown titles
- the batch no longer emits the earlier wave of weak opener/title warnings on the published carousels
- brief theses now land on materially stronger lines like calibration / attention-triage / practice-environment claims instead of transcript scaffolding

### What it exposed next

The next weak point is now clearer:
- some packages still create structurally thin support slots (`thin-brief-support`)
- those thin slots can cascade into `Untitled slide` placeholders and post-rebuild export-count drift until `build-pages` is rerun

So the next improvement should probably be **support-slot / empty-slide compaction** rather than yet another first-sentence regex.

## Latest follow-up pass: reserve titles for thin briefs

Another repeatability leak showed up in the `why-every-ai-skill...` package: structurally thin briefs were cascading into literal `Untitled slide` headings in published markdown.

### What changed

- slide-title selection now carries explicit reserve titles for each carousel position instead of falling all the way through to `Untitled slide`
- the reserve pool is brief-aware, so thin briefs still get a non-overlapping operator-style title drawn from their own why/support territory before the builder uses a generic fallback
- the initial draft pass now feeds those reserve titles into slide 2/3/4 selection directly, not just the later editorial polish pass

### What this fixed

- rebuilt thin-brief packages no longer publish `Untitled slide` headings just because support extraction came up short
- self-test signal gets cleaner: remaining warnings point at the real upstream issue (`thin-brief-support`) instead of downstream placeholder titles
- Pages/staging inspection is more trustworthy because weak brief structure no longer creates obviously stale-looking placeholder copy in otherwise fresh output

### Why it matters

A fresh agent should be able to rerun a package and inspect the output without guessing whether placeholder titles mean a broken render, a stale artifact, or just weak upstream support.

Reserve titles make the failure mode legible:
- upstream weakness stays visible in `briefs.json`
- downstream markdown still reads like a deliberate draft
- self-test can focus on actual brief quality instead of shouting about `Untitled slide`

## Latest follow-up pass: invalidate same-slug derived artifacts on rebuild

Another repeatability hole showed up at the rebuild boundary itself: when a source package regenerated an existing slug with different slide structure, the repo only cleaned artifacts for dropped slugs.

That meant a same-slug rebuild could leave behind:
- `public/exports/<slug>/manifest.json` from the old render
- `.pages-serve/<repo>/carousel/<slug>` from the old staging build
- `out/carousel/<slug>` from the old static export

So self-test would correctly see fresh markdown but still compare it against stale PNG manifests/routes and raise noisy `export-slide-count-mismatch` errors.

### What changed

- ingest/rebuild now invalidates derived artifacts for **every regenerated slug**, not just dropped slugs
- the cleanup now clears:
  - `public/exports/<slug>`
  - `.pages-serve/<repo>/carousel/<slug>`
  - `out/carousel/<slug>`
- dropped slugs still get full cleanup, including `carousels/<slug>` removal
- kept slugs keep their markdown directory, but their downstream render/static artifacts are intentionally wiped so the next `build-pages` run is forced to regenerate them

### What this fixed

Rebuilding the noisy Block package no longer leaves stale 5-PNG manifests attached to freshly generated 6-slide markdown.

After rebuild, self-test now reports the more truthful state:
- `missing-export-manifest` for regenerated slugs until `build-pages` is rerun
- no misleading slide-count mismatch errors from old manifests pretending to be current

### Why it matters

This makes handoffs much less confusing for a fresh agent:
- markdown state is current
- old derived artifacts are not allowed to impersonate fresh output
- `self-test` now signals "render/pages not rebuilt yet" instead of suggesting the renderer silently dropped slides

## Latest follow-up pass: pool-based reserve titles across the whole batch

Another repeatability leak was still sitting in the title fallback path itself.

The repo already had batch-level reservation, but `pickUniqueTitle()` still had a fallback branch that ignored the batch reservation set once the “good” candidates ran out. In practice that meant thin briefs could still converge back onto the same stock lines across a rebuild, especially on slide 4 / closing positions.

A first attempt to enforce uniqueness exposed a second issue: the emergency fallback pool was too small, so later carousels could degrade into placeholder-ish `Workflow review point N` titles. That was unique-ish, but it was ugly and self-test rightfully hated it.

### What changed

- slide 2/3/4 and editorial-polish fallback now consume an **ordered reserve-title pool** instead of a single deterministic reserve string
- `pickUniqueTitle()` no longer has a branch that reuses a title already claimed in the package-level reservation set
- last-resort generic titles now come from a larger deterministic operator/review pool plus combinatorial lead/tail variants instead of collapsing into `Workflow review point N`
- closing fallback now also exposes a pool, not just one preferred title, so later carousels can keep searching for a still-unused operator-style closing line

### What this fixed

After rebuild:

- `./content-carousel self-test why-every-ai-skill-you-learned-6-months-ago-is-already-wrong-and-what-is-replaci`
  - before this pass: duplicate slide-title warnings were still present (`A faster model is useless...`, then `Human review becomes...`)
  - after this pass: duplicate-title warnings are gone; remaining warnings are only structural (`thin-brief-support`) plus expected `missing-export-manifest` until `build-pages`
- `./content-carousel self-test 4-000-people-lost-their-jobs-at-block-dorsey-blamed-ai-here-s-what-actually-happ`
  - before this pass: duplicate carousel/slide-title noise was still getting triggered by repeated stock fallbacks
  - after this pass: duplicate-title warnings are gone; remaining warnings are upstream brief quality + expected missing export manifests

### Why it matters

This makes the title layer behave more like the rest of the pipeline contract:
- brief separation upstream is no longer quietly undone by a fallback branch downstream
- thin briefs still get readable operator-style titles instead of placeholders
- self-test signal is cleaner because duplicate-title noise now points more reliably at real claim overlap, not fallback implementation leakage

## Latest follow-up pass: demo-reference filtering for brief/title candidates

Another repeatability leak showed up in the AI-classrooms sample package: the brief builder was still treating presenter UI/demo narration as editorial copy.

That let lines like:
- `Here you can see the full chat.`
- `Here are some specs on its architecture.`
- `If you're interested in reading further, I'll link to this main page in the description below.`

survive into `whyItMatters`, support points, and sometimes even opening titles. Once those got into briefs, batch-level title reservation could keep them unique-ish, but the output was still obviously wrong.

### What changed

- added shared `isDemoReferenceLine()` heuristics in both:
  - `scripts/ingest-youtube.ts`
  - `scripts/self-test.ts`
- the new filter rejects common video/demo-reference narration patterns such as:
  - `here you can ...`
  - `here are ...`
  - `if you click/look/scroll ...`
  - `I'll link ...`
  - `description below`
  - `the full chat`
  - `here's the GitHub repo`
  - `for your reference`
- ingest now treats those lines as the same class of weak/meta copy as other transcript narration, so they are much less likely to become thesis / why / support / slide-title material
- self-test uses the same family of rules so audit behavior matches generation behavior instead of letting those lines quietly pass review

### What this fixed

After rebuild:

- `./content-carousel self-test ai-classrooms-self-evolving-ai-nvidia-gtc-ai-for-polymarket-google-app-builder-a`
  - before: duplicate carousel-title + duplicate slide-title warnings driven by `The edge is not knowing one workflow...` and `Here you can see the full chat.`
  - after rebuild: only expected `missing-export-manifest` warnings until render/build
- after `./content-carousel build-pages`, the same source now passes source-local review cleanly:
  - `./content-carousel self-test ai-classrooms-self-evolving-ai-nvidia-gtc-ai-for-polymarket-google-app-builder-a`
    - 0 errors
    - 0 warnings
- `--strict-global` still reports lots of repo-wide stale-artifact notes for other source packages, which is expected because that mode audits the whole preview/static tree, not just the current source package

### Why it matters

This hardens the earliest useful boundary in the pipeline:
- video/demo narration is filtered before it can become a claim
- claims become cleaner briefs
- briefs produce more distinct carousels
- self-test is less noisy because it is checking for the same class of junk the generator now rejects

## Latest follow-up pass: clause-aware support extraction

Another repeatability leak was still showing up in the brief layer: some transcript chunks had enough usable claim material, but the support builder only split on hard punctuation. In practice that meant long run-on transcript sentences stayed glued together, so the builder could see just **one** acceptable support line where there were actually 2-3 distinct claims hiding inside.

### What changed

- `splitIntoClauses()` now also breaks on a small set of intra-sentence editorial pivots (`because`, `but`, `while`, `where`, `when`, `if`, `so`)
- clause fragments now run through `normalizeClauseStart()` so lowercase-leading subclauses can still compete in the same candidate pool as normal sentence starts
- support backfill therefore gets more usable fragments from the same primary segment instead of giving up after the first surviving full sentence

### What this improved

After rebuild + `build-pages`:

- `./content-carousel self-test why-every-ai-skill-you-learned-6-months-ago-is-already-wrong-and-what-is-replaci`
  - now returns clean
  - the prior wave of `thin-brief-support` warnings is gone
- `./content-carousel self-test 4-000-people-lost-their-jobs-at-block-dorsey-blamed-ai-here-s-what-actually-happ`
  - still has 2 structural warnings, but both improved from **0 support points** to **1 support point**
- `./content-carousel self-test claude-code-wiped-2-5-years-of-data-the-engineer-who-built-it-couldn-t-stop-it`
  - still has 1 structural warning on `brief-segment-05`

### What it exposed next

The remaining noisy cases are now narrower and more honest:

- some source segments simply do not contain enough distinct support territory even after clause splitting
- the next improvement is likely **support sufficiency gating / claim extraction**, not another fallback-title tweak
- specifically, the stubborn survivors are:
  - `4-000-people-lost-their-jobs-at-block-dorsey-blamed-ai-here-s-what-actually-happ`
    - `brief-segment-41`
    - `brief-segment-63`
  - `claude-code-wiped-2-5-years-of-data-the-engineer-who-built-it-couldn-t-stop-it`
    - `brief-segment-05`

## Likely next improvement

Move from heuristic brief construction to **explicit claim extraction + claim clustering** across the full source package.

Concretely:
- create explicit claim records instead of treating published ideas as the only brief inputs
- cluster related claims into themes before any brief is promoted
- reserve thesis/support/title territory already claimed by earlier selected briefs in the same rebuild
- score claim lines for speaker-filler / fragment risk before they ever become a brief field
- add claim provenance so self-test can point back to the exact transcript line that caused a weak brief

That still looks like the right next layer to attack, because the main remaining warnings are now mostly:
- `thin-brief-support`
- occasional weak long-form thesis lines that are semantically noisy before title generation even starts
