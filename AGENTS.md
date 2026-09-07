# Agent guide (motion-panels repository)

This repo is the **motion-panels** monorepo (library + docs site). Agents here are **maintainers** working on the package or the docs.

## Repository layout

| Path | Purpose |
| --- | --- |
| `motion-panels/` | Published npm package (`motion-panels`); build inside this folder |
| `motion-panels/src/core/` | Framework-agnostic engine — panel sizing, grips, group state, DOM writes |
| `motion-panels/src/react/` | React adapter (`Group`, `Panel`, `Separator`) |
| `docs/` | Documentation site (Next.js + Tailwind + Base UI) |
| `docs/content/` | Page sections and the API reference table |
| `docs/demos/` | Live demos; each one is also its own displayed source |
| `docs/components/ui/` | shadcn-generated components — lint-ignored, do not hand-edit |

The package exports two entrypoints: `motion-panels` (core) and `motion-panels/react`. `motion` is a peer dependency; `react` is an optional peer.

## Maintainer commands

From repo root (pnpm workspace: `motion-panels`, `docs`):

```bash
pnpm install
pnpm test                    # vitest in motion-panels
pnpm run check-types
pnpm run lint                # oxlint, type-aware, warnings are errors
pnpm run format              # oxfmt
pnpm run format:check
pnpm run build               # tsdown, into motion-panels/dist
pnpm run docs                # docs site on http://localhost:3200
```

A `pre-commit` hook runs `format:check`, `test`, `lint` and `check-types` in parallel — the same checks CI runs.

## Conventions

- Lint and format are oxlint/oxfmt only. No ESLint, no Prettier, no Biome.
- Shared lint/format ignore patterns live in `ignores.ts`.
- Do not commit unless the user asks.
