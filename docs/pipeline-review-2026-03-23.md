# Pipeline Review — 2026-03-23

## What changed

Added a fallback support-selection path in `scripts/ingest-youtube.ts` so brief generation no longer depends only on top-ranked `candidate` ideas.

New behavior:
- keep the existing preferred path: use non-duplicate `candidate` ideas first
- if support is still thin, pull from nearby non-published transcript ideas (`segment ±2`) that contain usable editorial fragments
- rank fallback support by freshness + proximity to the primary idea so the resulting brief stays anchored in the same local transcript context

Key helpers added:
- `pickSupportingIdeas(...)`
- `uniqueIdeasById(...)`
- `supportIdeaDistance(...)`
- `isNearbyIdea(...)`
- `numericIdeaOrder(...)`

## Why

The old path was brittle when a strong published segment sat inside a locally dense part of the transcript but adjacent support chunks were rejected during idea scoring. That produced briefs with weak or generic support and made downstream carousel copy feel under-explained.

This showed up most clearly in:
- `4-000-people-lost-their-jobs-at-block-dorsey-blamed-ai-here-s-what-actually-happ`
- `claude-code-wiped-2-5-years-of-data-the-engineer-who-built-it-couldn-t-stop-it`

After the change, those briefs now pull nearby context instead of falling back to distant generic candidates.

## Verification run

Rebuilt sources:
- `./content-carousel rebuild-source 4-000-people-lost-their-jobs-at-block-dorsey-blamed-ai-here-s-what-actually-happ`
- `./content-carousel rebuild-source claude-code-wiped-2-5-years-of-data-the-engineer-who-built-it-couldn-t-stop-it`

Built pages/exports:
- `./content-carousel build-pages`

Self-test after rebuild/export:
- `./content-carousel self-test 4-000-people-lost-their-jobs-at-block-dorsey-blamed-ai-here-s-what-actually-happ` → `Errors: 0  Warnings: 0`
- `./content-carousel self-test claude-code-wiped-2-5-years-of-data-the-engineer-who-built-it-couldn-t-stop-it` → `Errors: 0  Warnings: 0`

## Concrete output differences worth noting

Examples of improved support locality:
- Block `brief-segment-41` now anchors support in `segment-40` and `segment-43` instead of relying on no nearby support at all.
- Block `brief-segment-63` now picks up `segment-64`, `segment-62`, `segment-61`.
- Claude `brief-segment-05` now uses `segment-06`, `segment-04`, `segment-07`.
- Claude `brief-segment-69` now uses `segment-68`, `segment-70`, `segment-71`.

Net effect: briefs are more coherent, less generic, and more reproducible across reruns because support stays close to the source claim instead of depending on the global candidate pool.

## Follow-up change (same review block)

Implemented the next pass immediately instead of leaving it as a TODO.

What changed:
- added a shared `isFragmentaryBriefLine(...)` heuristic to both `scripts/ingest-youtube.ts` and `scripts/self-test.ts`
- brief thesis / why / support selection now rejects fragmentary clause candidates before they can become briefs
- clause-level extraction now only keeps clauses that survive the fragment check, so rebuilds stop promoting dangling openers like `If you are waiting and seeing` or `Where all of those coordination artifacts go away`
- support backfill now also respects the fragment filter instead of only checking length/meta rules
- self-test now flags fragmentary brief lines as `weak-brief-*`, which closes the blind spot where the pipeline looked "clean" even while briefs still contained transcript shards

## Verification run

Rebuilt sources after the fragment filter landed:
- `./content-carousel rebuild-source 4-000-people-lost-their-jobs-at-block-dorsey-blamed-ai-here-s-what-actually-happ`
- `./content-carousel rebuild-source why-every-ai-skill-you-learned-6-months-ago-is-already-wrong-and-what-is-replaci`
- `./content-carousel rebuild-source mckinsey-says-1-trillion-in-sales-will-go-through-ai-agents-most-businesses-are-`

Rebuilt pages/exports:
- `./content-carousel build-pages`

Audit behavior before rebuild (proves the new test catches the old failure mode):
- Block source → `Warnings: 19`
- Boundary-sensing source → `Warnings: 15`
- McKinsey source → `Warnings: 2`

Self-test after rebuild/export:
- `./content-carousel self-test 4-000-people-lost-their-jobs-at-block-dorsey-blamed-ai-here-s-what-actually-happ` → `Errors: 0  Warnings: 0`
- `./content-carousel self-test why-every-ai-skill-you-learned-6-months-ago-is-already-wrong-and-what-is-replaci` → `Errors: 0  Warnings: 0`
- `./content-carousel self-test mckinsey-says-1-trillion-in-sales-will-go-through-ai-agents-most-businesses-are-` → `Errors: 0  Warnings: 0`

## Concrete outcome

This closes a repeatability gap in the middle of the pipeline:
- transcript clause extraction is less willing to surface mid-thought shards
- brief generation is less likely to recycle dangling openers into thesis / why / support
- self-test now catches the problem if a future heuristic regression reintroduces fragmentary copy

Examples that now get filtered instead of promoted:
- `Every serious conversation about AI`
- `Where all of those coordination artifacts go away`
- `If you are waiting and seeing`
- `Maintains the failure models`

## Follow-up pass: conditional-fragment false positives + demo-reference sludge

Implemented one more concrete hardening pass after the fragment filter work.

What changed:
- tightened `isDemoReferenceLine(...)` in both `scripts/ingest-youtube.ts` and `scripts/self-test.ts`
- the filter now catches more promo/reference phrasing such as:
  - `If you're interested in reading further...`
  - `I'll link to this page...`
  - `click on this demo link`
  - `for your reference`
  - `description below`
- brief-line validation now also treats extremely long thesis / why / support candidates (`>180` chars) as weak instead of letting giant transcript mush through unchanged
- `isFragmentaryBriefLine(...)` was relaxed for complete conditional sentences, so self-test no longer falsely flags legitimate lines like `If your mental model is stale, you redesign the wrong part of the workflow.` just because they start with `If`

## Verification run

Rebuilt source:
- `./content-carousel rebuild-source ai-classrooms-self-evolving-ai-nvidia-gtc-ai-for-polymarket-google-app-builder-a`

Self-test after rebuild:
- `./content-carousel self-test ai-classrooms-self-evolving-ai-nvidia-gtc-ai-for-polymarket-google-app-builder-a`
- result: only `missing-export-manifest` warnings remain until `build-pages` is rerun
- the previous weak lines are gone from `briefs.json`:
  - no more `If you're interested in reading further...`
  - no more `description below` / `for your reference` support points
  - no more false-positive weak warning for `If your mental model is stale...`

## Follow-up pass: overlong-claim compaction before brief ranking

Implemented the next target immediately.

What changed:
- added `compactBriefCandidate(...)` in `scripts/ingest-youtube.ts`
- overlong transcript lines now get a second pass through sentence + clause extraction before brief ranking instead of being thrown away wholesale for exceeding the brief-length ceiling
- the compactor only keeps candidates that are still editorially usable: non-meta, non-fragmentary, and within the preferred brief line width
- `sortEditorialCandidates(...)` now ranks the compacted version of each candidate, which means thesis / why / support selection consistently prefers claim-sized statements over giant transcript mush

Why this matters:
- previously, complete but overlong transcript blobs could survive long enough to poison the candidate pool, then get rejected late as weak lines or force generic fallbacks
- now the pipeline tries to salvage the sharp sub-claim inside the blob first, which makes reruns more stable when the same transcript segment contains one good sentence buried inside a long paragraph

## Verification run

Rebuilt sources after the compaction pass:
- `./content-carousel rebuild-source 4-000-people-lost-their-jobs-at-block-dorsey-blamed-ai-here-s-what-actually-happ`
- `./content-carousel rebuild-source claude-code-wiped-2-5-years-of-data-the-engineer-who-built-it-couldn-t-stop-it`
- `./content-carousel rebuild-source mckinsey-says-1-trillion-in-sales-will-go-through-ai-agents-most-businesses-are-`
- `./content-carousel rebuild-source why-every-ai-skill-you-learned-6-months-ago-is-already-wrong-and-what-is-replaci`

Then rendered Pages / exports:
- `./content-carousel build-pages`

Self-test after rebuild/export:
- `./content-carousel self-test 4-000-people-lost-their-jobs-at-block-dorsey-blamed-ai-here-s-what-actually-happ` → `Errors: 0  Warnings: 0`
- `./content-carousel self-test claude-code-wiped-2-5-years-of-data-the-engineer-who-built-it-couldn-t-stop-it` → `Errors: 0  Warnings: 0`
- `./content-carousel self-test mckinsey-says-1-trillion-in-sales-will-go-through-ai-agents-most-businesses-are-` → `Errors: 0  Warnings: 0`
- `./content-carousel self-test why-every-ai-skill-you-learned-6-months-ago-is-already-wrong-and-what-is-replaci` → `Errors: 0  Warnings: 0`

## Concrete outcome

This closes another repeatability gap in the brief layer:
- long transcript paragraphs are less likely to force fallback copy
- thesis / why / support extraction is more willing to rescue the sharp sentence inside a rambling segment
- the same noisy sources that previously produced weak-brief churn now rebuild cleanly once exports are refreshed

## Follow-up pass: transcript lead-ins + spec-dump title bleed

Implemented the next concrete hardening pass after the compaction work.

What changed:
- added a shared `isTranscriptLeadInLine(...)` heuristic to both `scripts/ingest-youtube.ts` and `scripts/self-test.ts`
- thesis / title / support selection now rejects raw roundup-style lead-ins such as:
  - `So, this AI is called...`
  - `Also, this week...`
  - `one of them is called...`
  - `flagship foundation model ...`
  - short version-label / spec-dump blurbs like `v2 Pro`, `optimized for ...`, etc.
- self-test now flags those lines as weak titles / weak brief lines instead of letting them pass just because they are grammatically complete

Why:
- the previous fragment + demo-reference filters still let some technically valid but editorially useless roundup/spec narration survive
- that showed up most clearly in `ai-classrooms-self-evolving-ai-nvidia-gtc-ai-for-polymarket-google-app-builder-a`, where rebuilds could still publish titles and brief lines that read like host chatter or product-sheet copy instead of claims

Verification run:
- before rebuild with the new audit rules:
  - `./content-carousel self-test ai-classrooms-self-evolving-ai-nvidia-gtc-ai-for-polymarket-google-app-builder-a` → `Warnings: 21`
  - examples caught immediately: `So, this AI is called Terminator.`, `So, one of them is called Mimo V2 Pro...`, `Also, this week, we have two state-of-the-art...`
- rebuilt source:
  - `./content-carousel rebuild-source ai-classrooms-self-evolving-ai-nvidia-gtc-ai-for-polymarket-google-app-builder-a`
- refreshed staged Pages / exports:
  - `./content-carousel build-pages`
- self-test after rebuild/export:
  - `./content-carousel self-test ai-classrooms-self-evolving-ai-nvidia-gtc-ai-for-polymarket-google-app-builder-a` → `Errors: 0  Warnings: 0`

Concrete outcome:
- the pipeline is less willing to treat transcript-y intros and hardware/model-spec chatter as publishable editorial claims
- self-test now exposes this failure mode quickly, so a fresh agent can spot it before wasting time polishing bad carousels downstream
- rebuilds for the noisy roundup source now converge back to clean briefs/titles after exports are refreshed

## Follow-up pass: brief selection now scans the whole viable idea pool

Implemented another repeatability hardening pass after the focus/overlap work.

What changed:
- `scripts/ingest-youtube.ts` no longer limits brief generation to the ideas that happened to fill the initial `published` slots from segment ranking
- brief assembly now scans every non-rejected idea (`status !== rejected`) in score order and keeps going until it finds up to the publish limit worth of distinct, focused briefs
- accepted briefs now promote their seed idea to `published` even if that idea originally sat in the broader viable/candidate pool

Why:
- the old flow had a quiet front-of-list bias: if the first batch of strong segments later failed brief overlap/focus gating, lower-ranked but cleaner ideas never even got a chance to become a carousel
- that made rebuilds less repeatable because a source could look artificially empty just because the first few seeds were mushy, not because the whole transcript lacked usable territory

Verification run:
- `pnpm typecheck`
- repo-wide self-test sweep across current sources after the change:
  - `4-000-people-lost-their-jobs-at-block-dorsey-blamed-ai-here-s-what-actually-happ`
  - `ai-classrooms-self-evolving-ai-nvidia-gtc-ai-for-polymarket-google-app-builder-a`
  - `claude-code-wiped-2-5-years-of-data-the-engineer-who-built-it-couldn-t-stop-it`
  - `i-mapped-where-every-ai-agent-actually-sits-most-people-pick-wrong`
  - `mckinsey-says-1-trillion-in-sales-will-go-through-ai-agents-most-businesses-are-`
  - `why-every-ai-skill-you-learned-6-months-ago-is-already-wrong-and-what-is-replaci`
- result: existing clean sources stay clean; `i-mapped-where-every-ai-agent-actually-sits-most-people-pick-wrong` still lands on `INFO [no-publishable-briefs]`, which is useful because it proves the remaining bottleneck there is upstream claim/segment extraction, not brief-seed starvation anymore

Concrete outcome:
- brief generation is less brittle when top-ranked seeds collapse during gating
- future rebuilds can recover from bad early seeds without hand-editing the source package first
- for sources that still publish nothing after this pass, start looking earlier in the chain (segment boundaries / claim extraction), not at the brief picker

## Follow-up pass: discourse-aside rejection for `whyItMatters`

Implemented one more concrete hardening pass after the compaction / lead-in work.

What changed:
- tightened shared brief-line rejection in both `scripts/ingest-youtube.ts` and `scripts/self-test.ts`
- the generator + audit now reject discourse-heavy aside openers like:
  - `Well, one, ...`
  - `Also true of ...`
  - lines containing `by the way`
- the editorial scorer now also penalizes those shapes so neighboring cleaner sentences win during thesis / why / support ranking instead of transcript asides sneaking through just because they are grammatical

Why:
- two source packages were still mostly clean but leaked one ugly `weak-brief-why` each
- both failures were the same class of bug: transcript-valid sentences that were editorially junky as standalone claims
- examples caught in the wild:
  - `Well, one, as a leader, you should be building practice environments, not courseear.`
  - `Also true of physical product by the way is process.`

Verification run:
- before patch:
  - `./content-carousel self-test why-every-ai-skill-you-learned-6-months-ago-is-already-wrong-and-what-is-replaci`
    - `WARN [weak-brief-why] brief-segment-69 ... "Well, one, as a leader, ..."`
  - `./content-carousel self-test 4-000-people-lost-their-jobs-at-block-dorsey-blamed-ai-here-s-what-actually-happ`
    - `WARN [weak-brief-why] brief-segment-19 ... "Also true of physical product by the way is process."`
- rebuilt both sources after the patch:
  - `./content-carousel rebuild-source why-every-ai-skill-you-learned-6-months-ago-is-already-wrong-and-what-is-replaci`
  - `./content-carousel rebuild-source 4-000-people-lost-their-jobs-at-block-dorsey-blamed-ai-here-s-what-actually-happ`
- self-test after rebuild:
  - no more `weak-brief-why` warnings on either package
  - only expected `missing-export-manifest` warnings remain until `./content-carousel build-pages` is rerun

Concrete outcome:
- brief selection is a little less willing to promote transcript asides as standalone editorial claims
- self-test now catches the same discourse-aside failure mode the generator is trying to prevent
- the next likely weak spot is no longer `whyItMatters` cleanup on those packages; it has moved upstream again toward semantic focus / publish gating for broad-but-valid recap segments

## Follow-up pass: thesis-aware focus ranking + diffuse-brief audit

Implemented the next target instead of leaving it as a future note.

What changed:
- added thesis-aware reranking for `whyItMatters` and support selection in `scripts/ingest-youtube.ts`
- candidate lines still need to clear the existing editorial/fragment/meta filters, but ties now break toward lines that share more meaningful vocabulary with the chosen thesis
- added a matching `diffuse-brief-focus` audit in `scripts/self-test.ts`
- the new audit catches the annoying class of failure where every line is individually grammatical yet the brief still reads like a mushy recap rather than one coherent carousel argument

Why:
- the known noisy packages were syntactically clean after the earlier hygiene passes, but the remaining repeatability risk was semantic drift inside otherwise-valid briefs
- support selection was still mostly optimizing for generic editorial strength, which meant a broad recap sentence could occasionally outrank a more thesis-anchored support line

Verification run:
- `pnpm typecheck`
- rebuilt + re-exported the current sample source set:
  - `./content-carousel rebuild-source 4-000-people-lost-their-jobs-at-block-dorsey-blamed-ai-here-s-what-actually-happ`
  - `./content-carousel rebuild-source why-every-ai-skill-you-learned-6-months-ago-is-already-wrong-and-what-is-replaci`
  - `./content-carousel rebuild-source ai-classrooms-self-evolving-ai-nvidia-gtc-ai-for-polymarket-google-app-builder-a`
  - `./content-carousel rebuild-source claude-code-wiped-2-5-years-of-data-the-engineer-who-built-it-couldn-t-stop-it`
  - `./content-carousel rebuild-source mckinsey-says-1-trillion-in-sales-will-go-through-ai-agents-most-businesses-are-`
- `./content-carousel build-pages`
- full source sweep:
  - `for dir in sources/*; do ./content-carousel self-test "$(basename "$dir")"; done`

Concrete outcome:
- brief generation now prefers locally coherent support over merely decent recap prose
- self-test has a new tripwire for semantic-focus regressions, so a fresh agent can spot this class of issue without re-reading every generated carousel manually
- the next likely improvement is probably upstream claim clustering / publish gating again, but now there is at least a first-class audit signal for "this brief is clean but still too mushy"

## Follow-up pass: publish gating for diffuse briefs + audit distinction for zero-output sources

Implemented the next step instead of leaving it as a future note.

What changed:
- added `MIN_BRIEF_FOCUS_SCORE` gating in `scripts/ingest-youtube.ts`
- `buildBriefs(...)` now drops briefs whose assembled thesis / why / support set still fails the semantic-focus check instead of force-publishing them anyway
- removed the old "always return one fallback brief" behavior, because it was reintroducing exactly the mushy recap posts the new focus audit was catching
- updated `scripts/self-test.ts` so zero-output sources now report `INFO [no-publishable-briefs]` when the quality gate intentionally publishes nothing, instead of warning as if briefs were merely missing by accident

Why:
- the previous pass could detect diffuse briefs, but the generator still shipped them when no stronger brief survived
- that meant the audit was telling the truth while the pipeline kept publishing known-weak output anyway
- repeatability is better if the publish layer is blunt: no coherent claim, no carousel

Verification run:
- `pnpm typecheck`
- rebuilt sample sources:
  - `./content-carousel rebuild-source 4-000-people-lost-their-jobs-at-block-dorsey-blamed-ai-here-s-what-actually-happ`
  - `./content-carousel rebuild-source ai-classrooms-self-evolving-ai-nvidia-gtc-ai-for-polymarket-google-app-builder-a`
  - `./content-carousel rebuild-source claude-code-wiped-2-5-years-of-data-the-engineer-who-built-it-couldn-t-stop-it`
  - `./content-carousel rebuild-source mckinsey-says-1-trillion-in-sales-will-go-through-ai-agents-most-businesses-are-`
  - `./content-carousel rebuild-source why-every-ai-skill-you-learned-6-months-ago-is-already-wrong-and-what-is-replaci`
- `./content-carousel build-pages`
- full sweep:
  - `for dir in sources/*; do ./content-carousel self-test "$(basename "$dir")"; done`

Concrete outcome:
- Block / Claude / AI-classrooms / boundary-sensing sources now rebuild clean with `Warnings: 0`
- the McKinsey package no longer force-publishes a thin diffuse carousel; it now rebuilds to zero published carousels and self-test reports `INFO [no-publishable-briefs]` instead of a false warning
- current sample set is now clean without having to hand-wave diffuse-focus warnings away

## Follow-up pass: thesis-echo `whyItMatters` audit

Implemented one more concrete audit pass after the diffuse-brief gating work.

What changed:
- added shared `isRedundantWhyLine(...)` detection in `scripts/self-test.ts`
- `self-test` now emits `WARN [redundant-brief-why]` when a `whyItMatters` line is basically the thesis repeated verbatim or as a contained substring
- this catches a subtle repeatability failure where briefs look syntactically clean, but slide two adds no new value and masks a still-thin claim package upstream

Why:
- the current clean/noisy checks were good at fragments, overlap, stale exports, and diffuse support
- they were still blind to a lazy failure mode where the brief survives quality gates while `whyItMatters` merely restates the thesis
- example caught immediately after adding the audit:
  - Block source `brief-segment-10`
    - thesis: `If you are in any product company, the shipped product is the value.`
    - why: `The shipped product is the value.`

Verification run:
- `pnpm typecheck`
- `./content-carousel rebuild-source 4-000-people-lost-their-jobs-at-block-dorsey-blamed-ai-here-s-what-actually-happ`
- `./content-carousel self-test 4-000-people-lost-their-jobs-at-block-dorsey-blamed-ai-here-s-what-actually-happ`
- result:
  - `WARN [redundant-brief-why] brief-segment-10 has a why-it-matters line that mostly repeats the thesis`
  - plus the expected `missing-export-manifest` warning until `build-pages` is rerun

Concrete outcome:
- a fresh agent can now spot thesis/why redundancy without manually reading every brief
- the pipeline review is more honest: syntactic cleanliness no longer hides low-information slide-two copy
- this shifts the next improvement from vague quality feel to a specific generator target: force `whyItMatters` to add payoff, consequence, or operating implication instead of repeating the main claim

## Follow-up pass: actionable `redundant-brief-why` audit output

Tried the obvious generator-side fix for thesis-echo `whyItMatters`, but the Block sample still leaked the bad line after rebuild. Rather than pretend that was solved, this pass hardened the inspection path so the failure is now actionable.

What changed:
- `scripts/self-test.ts` now suggests the best support-line replacement when `redundant-brief-why` fires
- replacement scoring prefers support lines that still overlap the thesis but add consequence/payoff language (`cost`, `handoff`, `coordination`, `workflow`, `evaporates`, etc.) instead of repeating the claim
- practical effect: a fresh agent can see the likely repair target immediately without re-reading the whole brief/source package

Verification run:
- `pnpm typecheck`
- `./content-carousel self-test 4-000-people-lost-their-jobs-at-block-dorsey-blamed-ai-here-s-what-actually-happ`
- result now includes:
  - `WARN [redundant-brief-why] ... Best available support-line replacement: "Everything else is the cost of producing that value with an execution layer made out of humans."`

Concrete outcome:
- inspection got more useful even though the generator bug is still alive
- the next agent now has an explicit repair candidate instead of another vague quality warning
- this keeps the hourly review loop honest: failed generator repair attempts turn into better diagnostics, not fake confidence

## Follow-up pass: generator/self-test parity for `redundant-brief-why`

Implemented a real narrowing pass on the current weak spot instead of guessing at a bigger rewrite.

What changed:
- `scripts/ingest-youtube.ts` now has a shared `suggestReplacementWhy(...)` helper mirroring the self-test replacement scorer
- generator-side `repairWhyItMatters(...)` now uses that support-line replacement helper instead of relying only on the older inline sort path
- the final fallback inside `buildBriefs(...)` also now calls the same helper, so rebuilds and audits are at least pulling from one scoring rule when trying to promote a support line into `whyItMatters`

Why:
- the previous state had an annoying blind split: self-test could point at a clearly better support-line replacement, while the generator still sometimes kept the thesis-echo `whyItMatters`
- before changing anything larger, it was worth collapsing that scorer drift so the remaining failures are real pipeline behavior, not audit/generator disagreement

Verification run:
- `pnpm typecheck`
- rebuilt + audited the currently noisy packages:
  - `./content-carousel rebuild-source 4-000-people-lost-their-jobs-at-block-dorsey-blamed-ai-here-s-what-actually-happ`
  - `./content-carousel rebuild-source ai-classrooms-self-evolving-ai-nvidia-gtc-ai-for-polymarket-google-app-builder-a`
  - `./content-carousel rebuild-source claude-code-wiped-2-5-years-of-data-the-engineer-who-built-it-couldn-t-stop-it`
  - `./content-carousel rebuild-source why-every-ai-skill-you-learned-6-months-ago-is-already-wrong-and-what-is-replaci`
  - corresponding `./content-carousel self-test ...` after each rebuild

Concrete outcome:
- the Nvidia sample improved immediately: the old `redundant-brief-why` warning on `brief-segment-74` is gone after rebuild
- the stubborn Block / Claude / boundary-sensing samples still leak the issue, which proves the next fix is not just scoring parity anymore
- that is still useful progress: a fresh agent no longer needs to waste time wondering whether the generator and self-test are disagreeing about the same support replacement logic

## Follow-up pass: lowercase-normalized `redundant-brief-why` repair parity

Implemented the next concrete fix instead of leaving the parity note half-true.

What changed:
- updated generator-side `isRedundantWhyLine(...)` in `scripts/ingest-youtube.ts` to normalize both thesis and `whyItMatters` to lowercase before substring / overlap checks
- this closes a real parity gap with `scripts/self-test.ts`, which was already lowercasing before comparison
- practical bug shape: rebuilds could keep a thesis-echo `whyItMatters` if the only difference was capitalization inside the repeated clause (`Then you are working...` vs `... then you are working...`)

Why:
- the prior scorer-parity pass was real, but three noisy samples still proved the generator was missing some obvious thesis echoes
- the remaining gap was not more ranking complexity; it was simpler and dumber: generator redundancy checks were case-sensitive while self-test checks were not
- that meant the repair path sometimes never fired, so rebuilds kept obviously redundant slide-two copy even though audit could already see the problem

Verification run:
- `pnpm typecheck`
- rebuilt the previously noisy sources:
  - `./content-carousel rebuild-source claude-code-wiped-2-5-years-of-data-the-engineer-who-built-it-couldn-t-stop-it`
  - `./content-carousel rebuild-source why-every-ai-skill-you-learned-6-months-ago-is-already-wrong-and-what-is-replaci`
- refreshed Pages / exports:
  - `./content-carousel build-pages`
- audited both rebuilt packages:
  - `./content-carousel self-test claude-code-wiped-2-5-years-of-data-the-engineer-who-built-it-couldn-t-stop-it` → `Errors: 0  Warnings: 0`
  - `./content-carousel self-test why-every-ai-skill-you-learned-6-months-ago-is-already-wrong-and-what-is-replaci` → `Errors: 0  Warnings: 0`

Concrete outcome:
- the Claude and boundary-sensing packages no longer leak thesis-echo `whyItMatters` lines after rebuild
- this was a real repeatability bug, not subjective polish: the same source could audit as bad while rebuild logic still failed to repair it
- next improvement moves upstream again: better claim extraction / clustering so broad-but-clean recap territory gets rejected before brief assembly

## Follow-up verification reality check

A later hourly review re-ran the exact failure path that still looked suspicious in the repo state: the Block package was showing a lingering `redundant-brief-why` in `self-test` when inspected before a fresh rebuild/export refresh.

What changed:
- reran `./content-carousel rebuild-source 4-000-people-lost-their-jobs-at-block-dorsey-blamed-ai-here-s-what-actually-happ`
- reran `./content-carousel build-pages`
- re-swept all current sources with:
  - `for dir in sources/*; do ./content-carousel self-test "$(basename "$dir")"; done`

Concrete result:
- the apparent Block `redundant-brief-why` issue disappeared after the clean rebuild + Pages/export refresh
- every current source now comes back either clean or intentionally gated with `INFO [no-publishable-briefs]`
- practical lesson: do not treat a pre-refresh warning as a live generator regression until you have rebuilt the source package and refreshed Pages/exports, because current self-test output can still be reflecting stale source artifacts rather than the latest generator behavior

## Next improvement

The next likely weak spot is upstream again and more concrete now:
- explicit claim extraction / clustering before idea promotion, so broad recap segments get rejected before they ever become `published` ideas
- once that exists, use it to make distinct-claim boundaries more deliberate before thesis / why / support promotion instead of relying mostly on transcript segmentation + heuristics

## Follow-up pass: persist brief diagnostics for reset-proof inspection

Implemented a lighter-weight version of the "claim provenance / explainability" follow-up instead of leaving future agents blind after context reset.

What changed:
- published `briefs.json` records now persist a small `diagnostics` block per brief
- the diagnostics currently include:
  - `focusScore` — the same semantic-focus score used during publish gating
  - `overlapWithEarlierBriefs` — strongest normalized claim overlap against earlier accepted briefs in the same rebuild
  - `overlapWithNearestBriefId` — which earlier brief that overlap came from
  - `supportIdeaDistance` — how far each supporting idea sits from the primary segment in transcript order
- `summary.md` now mirrors those values next to each published brief so a fresh agent can inspect the package without re-running generator internals or re-deriving the same reasoning from scratch

Why:
- the repo sweep is currently clean, which is good, but that also makes the next bottleneck more subtle: broad recap territory that *passes* current gates yet still deserves inspection
- after a reset, the old state was annoying because `briefs.json` only showed the chosen lines, not *why* they survived the gate or which sibling brief they were closest to
- persisting the gating context makes the hourly review loop more repeatable and reduces "rebuild everything just to understand what happened" churn

Verification run:
- `pnpm typecheck`
- rebuilt the newest gated source package to refresh persisted artifacts:
  - `./content-carousel rebuild-source i-mapped-where-every-ai-agent-actually-sits-most-people-pick-wrong`
- audited the result:
  - `./content-carousel self-test i-mapped-where-every-ai-agent-actually-sits-most-people-pick-wrong`
- full source sweep still clean/intentionally gated:
  - `for dir in sources/*; do ./content-carousel self-test "$(basename "$dir")"; done`

Concrete outcome:
- a future agent can open `briefs.json` / `summary.md` and immediately see whether a brief barely cleared focus gating, sat too close to a sibling brief, or depended on distant support segments
- next improvement is still upstream claim extraction / clustering, but now the repo carries enough local evidence to make that pass targeted instead of guessy

## Follow-up pass: fix `rebuild-source` summary drift

While verifying the new diagnostics on the Block package, a real repeatability bug popped out: `briefs.json` and `source.json` correctly showed only one accepted brief/carousel after overlap/focus gating, but `summary.md` was still listing multiple earlier "published ideas" from the pre-gating pool.

Root cause:
- ingest path already rendered `summary.md` from `normalizedIdeas` (post-gating)
- rebuild path was still rendering `summary.md` from the raw `ideas` array (pre-gating)
- result: rebuilds could leave a misleading summary that contradicted the actual published carousel set, which is exactly the kind of stale-state confusion that wastes hourly review cycles

Fix:
- changed `scripts/ingest-youtube.ts` so `rebuild-source` now passes `normalizedIdeas` into `buildSummary(...)`, matching the ingest path

Verification run:
- `./content-carousel rebuild-source 4-000-people-lost-their-jobs-at-block-dorsey-blamed-ai-here-s-what-actually-happ`
- `./content-carousel build-pages`
- `./content-carousel self-test 4-000-people-lost-their-jobs-at-block-dorsey-blamed-ai-here-s-what-actually-happ`
- confirmed the regenerated `summary.md` now shows just the final accepted brief/carousel state instead of the pre-gating pseudo-published set
- full source sweep still clean/intentionally gated:
  - `for dir in sources/*; do ./content-carousel self-test "$(basename "$dir")"; done`

Concrete outcome:
- rebuild summaries are now trustworthy inspection artifacts again
- this is a small fix, but it matters because `summary.md` is the first thing a fresh agent reads when trying to understand what a prior run actually shipped

## Follow-up pass: repo-wide self-test mode for duplicate/stale-artifact review

Implemented a concrete inspection upgrade instead of doing another one-off manual sweep.

What changed:
- added `./content-carousel self-test --repo`
- repo mode now:
  - runs the normal per-source audit across every package under `sources/`
  - reports source-level clean / gated / noisy status in one pass
  - checks duplicate carousel titles across the currently referenced published set
  - checks duplicate slide titles across the currently referenced published set
  - checks stale artifact directories not referenced by **any** current source package in:
    - `carousels/`
    - `public/exports/`
    - `.pages-serve/<repo>/carousel/`
    - `out/carousel/`
- updated README + local skill docs so future agents know to use `--repo` for whole-repo inspection instead of abusing `--strict-global` on one source slug

Why:
- `self-test <source> --strict-global` was useful, but it framed repo-wide leftovers relative to one source package, which creates lots of expected false-positive noise
- hourly review work needed a clean way to answer a different question: “what is duplicated or stale across the repo right now?”
- that makes reset-proof inspection much better because a fresh agent can run one command and immediately see whether the next problem is local brief quality, repo-wide duplicate framing, or stale Pages/export artifacts

Verification run:
- `pnpm typecheck`
- `for dir in sources/*; do ./content-carousel self-test "$(basename "$dir")"; done`
- `./content-carousel self-test --repo`

Concrete findings from the new repo pass:
- all current source packages are either clean or intentionally gated with `INFO [no-publishable-briefs]`
- repo mode surfaced a real next bottleneck: several currently published carousels still share the same fallback thesis/title territory across different source packages
- repo mode also surfaced stale orphan artifacts for the currently gated `i-mapped-where-every-ai-agent-actually-sits-most-people-pick-wrong` package across markdown/export/staging/static trees

Next improvement:
- tighten cross-package title/fallback diversification so clean source-local packages do not still collapse into the same repo-wide opening/closing language
- decide whether orphaned `i-mapped...` artifacts should be auto-pruned during a repo cleanup path or remain explicit review targets

## Follow-up pass: salvage title-worthy subclauses before generic carousel fallbacks

Implemented a targeted title-generation hardening pass in `scripts/ingest-youtube.ts`.

What changed:
- added `compactDisplayCandidate(...)` to try sentence/clause salvage before a title candidate gets discarded as weak
- added `buildDisplayTitlePool(...)` so opening and reserve title pools can reuse salvaged subclauses instead of depending only on the raw thesis / why line
- `chooseOpeningTitle(...)` now evaluates both the original candidate and any salvaged compact variant
- reserve pools for slides 1-4 now include compacted variants of brief lines before falling back to the static generic title bank

Why:
- the current repeatability gap is no longer mostly in transcript -> brief extraction; it is now in brief -> carousel title selection
- several sources still converge onto the same repo-wide generic opening/title set (`AI workflows are shifting faster...`, `Stale mental models break...`) whenever the raw thesis/why line is slightly awkward even though a usable subclause exists inside it
- this change makes the title selector *try to rescue that sharper sub-claim first* instead of jumping straight to the reusable generic pool

Verification run:
- `pnpm typecheck`
- rebuilt sources:
  - `./content-carousel rebuild-source 4-000-people-lost-their-jobs-at-block-dorsey-blamed-ai-here-s-what-actually-happ`
  - `./content-carousel rebuild-source ai-classrooms-self-evolving-ai-nvidia-gtc-ai-for-polymarket-google-app-builder-a`
  - `./content-carousel rebuild-source claude-code-wiped-2-5-years-of-data-the-engineer-who-built-it-couldn-t-stop-it`
  - `./content-carousel rebuild-source why-every-ai-skill-you-learned-6-months-ago-is-already-wrong-and-what-is-replaci`
- refreshed staged Pages / exports:
  - `./content-carousel build-pages`
- repo audit:
  - `./content-carousel self-test --repo`

Result:
- the code path is live and type-clean
- the repo audit still reports the same duplicate-title cluster, which means the remaining problem is narrower now: some briefs still never surface a strong enough opening candidate even after clause salvage, so the selector still falls through to the static generic pool

Next improvement to prioritize:
- replace the remaining static repo-wide generic opener bank with **brief-conditioned synthetic title templates** derived from focus tokens in `brief.thesis` / `brief.whyItMatters` / `supportPoints`
- also consider adding a self-test note that explicitly counts how often a carousel had to use a `GENERIC_UNIQUE_TITLE_POOL` fallback, so future reviews can measure whether title specificity is actually improving instead of only checking final duplicate collisions

## Follow-up pass: repo-aware title reservation during rebuilds

Implemented the next fix directly in `scripts/ingest-youtube.ts`.

What changed:
- added `collectRepoTitleReservations(...)` to scan existing `carousels/*/carousel.md` files before ingest/rebuild writes a new batch
- title reservation now seeds `buildCarouselBundles(...)` with **repo-wide existing carousel titles + slide titles**, excluding the current source's own existing slugs so rebuilds can still keep a title when it is not colliding elsewhere
- practical effect: `pickUniqueTitle(...)` now avoids collisions against the rest of the repo, not just against slides inside the currently generated batch

Why:
- the previous hardening work made individual sources look clean, but repo-wide self-test still caught a real repeatability bug: different source packages were converging onto the same fallback opener / slide-title bank
- that meant the generator was locally batch-aware but not globally repo-aware, so a clean rebuild could still quietly reintroduce `duplicate-carousel-title-repo` / `duplicate-slide-title-repo`

Verification run:
- `pnpm typecheck`
- rebuilt the currently published sources:
  - `./content-carousel rebuild-source 4-000-people-lost-their-jobs-at-block-dorsey-blamed-ai-here-s-what-actually-happ`
  - `./content-carousel rebuild-source ai-classrooms-self-evolving-ai-nvidia-gtc-ai-for-polymarket-google-app-builder-a`
  - `./content-carousel rebuild-source claude-code-wiped-2-5-years-of-data-the-engineer-who-built-it-couldn-t-stop-it`
  - `./content-carousel rebuild-source why-every-ai-skill-you-learned-6-months-ago-is-already-wrong-and-what-is-replaci`
- refreshed staged Pages / exports:
  - `./content-carousel build-pages`
- repo audit:
  - `./content-carousel self-test --repo`

Result:
- repo audit now returns `Errors: 0  Warnings: 0`
- duplicate carousel-title and slide-title collisions are gone on the current published set
- the remaining repo-level notes are only the intentional `no-publishable-briefs` info items plus stale orphan artifacts for the gated `i-mapped-where-every-ai-agent-actually-sits-most-people-pick-wrong` package

Next improvement:
- decide whether stale orphaned `i-mapped...` markdown/export/staging/static artifacts should get an explicit repo-cleanup command or remain manual review targets
- if repo-wide title collisions reappear later, inspect whether a new fallback path bypassed `collectRepoTitleReservations(...)` before blaming brief extraction again
