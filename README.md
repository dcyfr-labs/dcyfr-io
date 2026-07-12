# dcyfr-io

The control center and front door for the DCYFR product ecosystem, live at **[dcyfr.io](https://dcyfr.io)**.

`dcyfr.io` is a Next.js 15 / React 19 control-center app: a single-page portal that maps and links out to the rest of the dcyfr-labs site family — [dcyfr-app](https://github.com/dcyfr-labs/dcyfr-app) (templates), [dcyfr-bot](https://github.com/dcyfr-labs/dcyfr-bot) (agents), [dcyfr-build](https://github.com/dcyfr-labs/dcyfr-build) (build workflows), [dcyfr-codes](https://github.com/dcyfr-labs/dcyfr-codes) (patterns), [dcyfr-tech](https://github.com/dcyfr-labs/dcyfr-tech) (research), and [dcyfr-work](https://github.com/dcyfr-labs/dcyfr-work) (developer portal) — including an RSS carousel surfacing recent ecosystem content.

## Stack

- Next.js 15 (App Router) / React 19 / Tailwind CSS
- shadcn primitives from the `@dcyfr-labs` registry (`registry.dcyfr.ai`); shared chrome (nav, footer, page shell, theme switcher/provider) in [`components/chrome/`](components/chrome/README.md)
- Sentry instrumentation (client, server, and edge configs) + Vercel analytics
- Playwright for e2e and visual-regression snapshots ([`e2e/`](e2e/README.md))

## Development

```sh
npm install
npm run dev        # http://localhost:3302
```

> **Port collision:** dev port **3302** is also claimed by [dcyfr-tech](https://github.com/dcyfr-labs/dcyfr-tech) — you cannot run both dev servers simultaneously without overriding one (`npm run dev -- --port <other>`).

| Command | What it does |
|---|---|
| `npm run dev` / `npm run start` | Dev / production server on port **3302** |
| `npm run build` | Production build |
| `npm run lint` / `npm run typecheck` | ESLint / `tsc --noEmit` |
| `npm run test:e2e` (`:ui`) | Playwright e2e suite |
| `npm run test:snapshots` (`:update`) | Visual-regression snapshots (chromium; the RSS carousel is hidden in snapshots to keep baselines stable) |

## Routes

- `/` — the control-center portal (single page)
- `/sitemap-index.xml` — sitemap index route

## Environment variables

No runtime secrets. `SENTRY_ORG` / `SENTRY_PROJECT` are used at build time for Sentry source-map upload; the site runs without them locally.

## Design-token & scaffold contract

This site follows the `dcyfr-site-scaffold` contract: colors, spacing, radii, and typography resolve via CSS variables — no hardcoded design tokens. Local ESLint rules in `eslint-local-rules/` enforce this and the `design-tokens.yml` workflow gates every PR. From the workspace root, `npm run audit:sites` checks scaffold compliance across the site family.

## CI

- `ci.yml` — lint, typecheck, build
- `codeql.yml` / `semgrep.yml` — static security analysis
- `design-tokens.yml` — design-token + scaffold gate
- `visual-regression.yml` — Playwright snapshots
- `dependabot-auto-merge.yml` — dependency hygiene

## Deployment

Deployed on Vercel from `main` (hardened headers via `vercel.json`). The operational runbook is [`DEPLOYMENT.md`](DEPLOYMENT.md) — note it is **TLP:AMBER**; treat its contents as limited-distribution.

## Further docs

- [`AGENTS.md`](AGENTS.md) — agent conventions and project structure
- [`components/chrome/README.md`](components/chrome/README.md) — shared chrome primitives
- [`e2e/README.md`](e2e/README.md) — test suite notes
