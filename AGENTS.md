# RIN // Neon Familiar — Project Instructions

## Purpose

This repository contains a static, immersive anime-character website and browser mini-game built for GitHub Pages.

## Character and asset boundary

- Human or character imagery may only use the project-owner-supplied RIN assets already present in `public/assets/`.
- Do not introduce new people, protagonists, mascots, faces, names, or character backstories.
- New outfits, poses, and actions may be designed only for the recognizable supplied green-channel and pink-channel characters.
- Rabbit marks are non-personified signal icons. They have no dialogue, name, or independent narrative identity.
- Abstract UI effects such as scanlines, rings, grids, waveforms, and particles may be code-generated.

## Architecture

- React + TypeScript + Vite.
- One static page with hash anchors; do not add server-dependent routes.
- Game rules remain pure and deterministic in `src/game/engine.ts`.
- Browser state is local-only. Do not add analytics, accounts, uploads, or remote persistence without explicit approval.

## Required checks

Run all of these before committing:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

For visible changes, also test the rendered site at desktop and mobile widths, check the browser console, and exercise the affected interaction.

## Deployment

- Public URL: `https://irin818.github.io/rin-neon-familiar/`
- Vite base path must remain `/rin-neon-familiar/` unless the repository and every canonical/manifest/sitemap URL are migrated together.
- GitHub Pages deploys from the `main` branch through `.github/workflows/deploy-pages.yml`.

## Protected files

Treat `AGENTS.md`, `README.md`, the Pages workflow, SEO metadata, and the approved design concept as slow-moving project contracts. Keep edits focused and preserve the asset boundary above.
