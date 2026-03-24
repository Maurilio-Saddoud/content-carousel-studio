## 2026-03-24 09:02 CDT — hourly review follow-up (final fallback title uniqueness)

Added a real last-resort uniqueness path for slide titles in `scripts/ingest-youtube.ts`.

### What changed

- `nextGenericUniqueTitle(...)` used to stay unique only while either:
  - `GENERIC_UNIQUE_TITLE_POOL`, or
  - `GENERIC_UNIQUE_TITLE_LEADS × GENERIC_UNIQUE_TITLE_TAILS`
  still had an unused entry
- once those pools were exhausted, it hard-returned the exact same sentence every time:
  - `The workflow still needs a clearer human checkpoint.`
- that meant repo-level title reservations could still force one thin carousel into repeated duplicate slide titles even though the normal picker was batch-aware and repo-aware
- fixed by adding:
  - `FINAL_RESERVE_TITLE_BASES`
  - numbered uniqueness fallback (`Base (2).`, `Base (3).`, etc.) after all ordinary pools are exhausted

### Why this mattered

The current `i-mapped-where-every-ai-agent-actually-sits-most-people-pick-wrong` rebuild path finally became publishable again after the segmentation replay fix, which is good.

But one rescued carousel immediately exposed a quieter repeatability hole:
- `./content-carousel self-test --repo` no longer complained about segmentation/brief gating
- it complained about the same generic slide title repeated across slides 2–7 inside one carousel
- so the system was still not truly deterministic under repo-wide title pressure

That is exactly the sort of downstream papercut that makes a pipeline *look* healthy while still shipping stale-looking output.

### Verification

Ran:

```bash
pnpm typecheck
./content-carousel rebuild-source i-mapped-where-every-ai-agent-actually-sits-most-people-pick-wrong
./content-carousel self-test i-mapped-where-every-ai-agent-actually-sits-most-people-pick-wrong
./content-carousel build-pages
./content-carousel self-test --repo
```

Observed after the patch:
- the offending `i-mapped...segment-29...` carousel no longer repeats the exact same slide title across slides
- source-level self-test dropped from duplicate-title warnings to the expected temporary `missing-export-manifest` warnings before `build-pages`
- after `build-pages`, repo self-test returned `Errors: 0  Warnings: 0`

### Practical rule

Do not assume “we already have a generic fallback title pool” means duplicate-title protection is done.

If repo-level reservations can exhaust the nice titles, the *last* fallback still has to preserve uniqueness or self-test will quite correctly keep yelling at you.

### Next improvement

The repo is clean again, but the new weak point is aesthetic rather than structural:
- the suffix-based emergency fallback is honest and deterministic
- it is not elegant copy

So the next worthwhile pass is not more integrity plumbing. It is editorial polish for thin briefs that hit the emergency reserve path, so they land on distinct **and** better-sounding titles before numbering is ever needed.
