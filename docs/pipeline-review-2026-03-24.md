# Pipeline review — 2026-03-24

## What changed

- Fixed a real repeatability regression in the first-class CLI: `./content-carousel self-test --repo` was documented everywhere, but the bundled parser still only accepted `self-test <source-slug>`.
- Added actual repo-mode support in `scripts/self-test.ts`.
- Repo mode now:
  - runs the normal per-source audit for every package in `sources/`
  - checks cross-package duplicate carousel titles
  - checks cross-package duplicate slide titles
  - flags stale `carousels/*` directories not referenced by any source package
  - flags stale `public/exports/*` directories not referenced by any source package
  - flags stale `.next/server/app/carousel/*` residue so build drift is visible without manual spelunking
- Updated the CLI help text and README so the documented self-test path matches the actual shipped command again.

## Why it mattered

The hourly review loop had been relying on a repo-wide audit path that did not actually exist in the main CLI. That is exactly the kind of quiet repeatability bug that wastes time after context reset: docs say one thing, the command errors, and a fresh agent has to rediscover how to inspect the repo.

Fixing the parser is boring, but it is the right boring. If the inspection path lies, the whole "hourly audit" habit gets flaky.

## Verification

Primary verification path:

```bash
pnpm typecheck
./content-carousel self-test --repo
```

Expected behavior now: repo mode runs instead of throwing the old usage error.

## Follow-up hardening on the same day

A second repeatability fix landed after the repo-mode parser repair: missing markdown refs are now triaged instead of dumped as a generic error.

What changed:

- `scripts/self-test.ts` now inspects whether a missing carousel slug still has a `carousels/<slug>/` directory, a `public/exports/<slug>/` directory, or a surviving export manifest.
- If **nothing** exists for that slug, self-test adds `orphan-source-carousel-ref`, which is the practical hint that `source.json` still points at a dropped segment rather than a render/build drift problem.
- If export artifacts still exist, the error text now says so directly, which makes stale artifact cleanup more obvious after context reset.

Why this mattered:

The old `missing-carousel-markdown` error was technically correct but operationally lazy. A fresh agent still had to go spelunking to answer the real question: *is this a stale source manifest, a partial delete, or just render drift?* The self-test should do that first-pass diagnosis itself.

## Verification

Primary verification path now:

```bash
pnpm typecheck
./content-carousel self-test --repo
```

On the current repo snapshot, the missing-markdown cases now also emit the orphan-manifest hint for the segment-130 and segment-62 references, which is exactly the extra context the hourly review loop kept having to rediscover.

## Follow-up hardening later the same day

A third repeatability fix landed after the orphan-ref diagnostics: the repo now has a deliberate repair path for drifted source manifests.

What changed:

- added `./content-carousel sync-source <source-slug>` to the bundled CLI
- `sync-source` now treats surviving `ideas.json`, `briefs.json`, and `carousels/<slug>/carousel.md` files as the canonical truth when `source.json` drifted
- it rewrites `sources/<source-slug>/source.json` from the surviving markdown-backed carousels
- it refreshes `sources/<source-slug>/summary.md`
- it also demotes orphaned `published` ideas in `ideas.json` when their published carousel markdown no longer exists, so `self-test` stops reporting fake manifest/publication mismatches
- README + skill docs were updated so a fresh agent sees `sync-source` as the intentional repair step instead of rediscovering it from code

Why this mattered:

The previous audit improvement could *diagnose* orphan source refs, but the recovery move was still fuzzy. Rebuilding an entire source package just to prune two dead slugs is noisy and can change editorial output. Hand-editing `source.json` is brittle and easy to forget after context reset. `sync-source` gives the pipeline a boring, explicit "make the manifest match reality" button.

## Verification

Primary verification path now:

```bash
pnpm typecheck
./content-carousel sync-source ai-classrooms-self-evolving-ai-nvidia-gtc-ai-for-polymarket-google-app-builder-a
./content-carousel sync-source why-every-ai-skill-you-learned-6-months-ago-is-already-wrong-and-what-is-replaci
./content-carousel self-test --repo
```

Observed result on the current repo snapshot:

- repo self-test moved from **2 errors** to **0 errors**
- the previous stale-manifest failures for `segment-130` and `segment-62` are gone
- remaining output is warning-only and mostly about weak titles / thin brief support / known stale directories in the `i-mapped-where-every-ai-agent-actually-sits-most-people-pick-wrong` batch

## Follow-up hardening during the 14:00 hourly review

A fourth repeatability improvement landed in the audit path: self-test can now emit machine-readable JSON.

What changed:

- `./content-carousel self-test <source-slug> --json` now prints `{ label, counts, issues }`
- `./content-carousel self-test --repo --json` does the same for the repo-wide audit
- exit-code behavior stays the same: any error-level issue still exits non-zero, so existing shell automation keeps working
- CLI help + README were updated so the JSON path is visible to a fresh agent immediately

Why this mattered:

The hourly review loop had already become "run repo self-test, inspect drift, decide whether to repair or just document." Plaintext is fine for a human, but annoying for repeatable automation. JSON gives the pipeline a stable inspection format for:

- diffing counts across runs
- tracking the exact issue codes/messages that appeared or disappeared
- piping audit results into later cleanup/reporting steps without brittle text scraping

## Verification

Primary verification path now:

```bash
pnpm typecheck
./content-carousel self-test --repo --json
```

Observed result on the current repo snapshot:

- JSON output now includes the same repo label, counts, and issue array as the text mode
- the command still exits non-zero on the current known repo error (`export-slide-count-mismatch`), which preserves CI/scripting usefulness

## Next likely improvement

The next useful hardening pass is probably cleanup ergonomics for stale directories and stale exports, not more manifest parsing:

- add a deliberate cleanup command for stale `carousels/` + `public/exports/` dirs that are no longer referenced by any source package, or
- add a focused repair path for stale export batches when markdown slide counts changed but `public/exports/<slug>/manifest.json` was not regenerated yet.
