# content-carousel-studio

React-powered carousel studio for transcript-driven social content.

## What it does

- hosts many carousels in one repo
- gives each carousel a GitHub Pages preview route
- keeps source material and finished carousel content organized
- renders portrait PNG exports for LinkedIn / Instagram carousels

## Structure

- `carousels/` — finished carousel configs
- `sources/` — raw source material and notes
- `src/` — React preview app
- `scripts/` — PNG rendering scripts
- `exports/` — generated PNGs (local only)

## Commands

```bash
pnpm dev
pnpm build
pnpm preview
pnpm render ai-memory-wall
pnpm render:all
```

## GitHub Pages

This repo is designed to deploy the built `dist/` site to GitHub Pages.
