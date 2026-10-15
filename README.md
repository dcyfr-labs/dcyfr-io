# dcyfr-io

The control center and front door for the DCYFR product ecosystem, live at **[dcyfr.io](https://dcyfr.io)**.

`dcyfr.io` is a Next.js 16 / React 19 control-center app: a single-page portal that maps and links out to the rest of the dcyfr-labs site family — [dcyfr-app](https://github.com/dcyfr-labs/dcyfr-app) (templates), [dcyfr-bot](https://github.com/dcyfr-labs/dcyfr-bot) (agents), [dcyfr-build](https://github.com/dcyfr-labs/dcyfr-build) (build workflows), [dcyfr-codes](https://github.com/dcyfr-labs/dcyfr-codes) (patterns), [dcyfr-tech](https://github.com/dcyfr-labs/dcyfr-tech) (research), and [dcyfr-work](https://github.com/dcyfr-labs/dcyfr-work) (developer portal) — including an RSS carousel surfacing recent ecosystem content.

## Stack

- Next.js 16 (App Router) / React 19 / Tailwind CSS
- shadcn primitives from the `@dcyfr-labs` registry (`registry.dcyfr.ai`); shared chrome (nav, footer, page shell, theme switcher/provider) in [`components/chrome/`](components/chrome/)
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
- `/sitemap-index.xml` — sitemap index route, listing the sitemaps of the other family sites
- `/privacy` — privacy notice
- `/robots.txt`, `/sitemap.xml` — generated from `app/robots.ts` and `app/sitemap.ts`
- `/indexnow.txt` — IndexNow key file (see Environment variables)
- `/.well-known/security.txt` — RFC 9116 security contact
- `POST /api/indexnow/webhook` — Vercel team webhook receiver. On a successful production deployment of a mapped dcyfr-* project it submits that host's sitemap to IndexNow. Requests must carry a valid `x-vercel-signature`.
- `GET /api/indexnow/cron` — weekly backstop (Mondays 06:00 UTC, `vercel.json`) that submits every mapped host. Requires `Authorization: Bearer $CRON_SECRET`.

## Environment variables

None are required to run locally; every variable below is optional.

| Variable | Use |
|---|---|
| `NEXT_PUBLIC_SENTRY_DSN` | Client-side Sentry reporting (`instrumentation-client.ts`) |
| `SENTRY_DSN` | Server and edge Sentry reporting; falls back to `NEXT_PUBLIC_SENTRY_DSN` |
| `SENTRY_ORG` / `SENTRY_PROJECT` | Build-time source-map upload; default to `dcyfr-labs` / `dcyfr-io` (`next.config.ts`) |
| `INDEXNOW_KEY` | Served at `/indexnow.txt`, and used by the IndexNow receiver below to submit the family's sitemaps. The route returns 404 and submissions are skipped when unset |
| `INDEXNOW_WEBHOOK_SECRET` | Signing secret for `POST /api/indexnow/webhook`; the route answers 401 when unset |
| `CRON_SECRET` | Bearer token Vercel Cron sends to `GET /api/indexnow/cron`; the route answers 401 when unset |

dcyfr-io hosts the IndexNow receiver for the whole family (`lib/indexnow.ts`, `PROJECT_HOSTS`). It only submits a host after fetching that host's `/indexnow.txt` and confirming it matches `INDEXNOW_KEY`, so every site in the family serves the same key.

## Design-token & scaffold contract

This site follows the `dcyfr-site-scaffold` contract: colors, spacing, radii, and typography resolve via CSS variables — no hardcoded design tokens. Local ESLint rules in `eslint-local-rules/` enforce this and the `design-tokens.yml` workflow gates every PR. From the workspace root, `npm run audit:sites` checks scaffold compliance across the site family.

## CI

- `ci.yml` — lint, typecheck, build
- `codeql.yml` / `semgrep.yml` — static security analysis
- `design-tokens.yml` — design-token + scaffold gate
- `visual-regression.yml` — Playwright snapshots
- `dependabot-auto-merge.yml` — dependency hygiene

## Deployment

Deployed on Vercel from `main` (hardened headers via `vercel.json`). The operational runbook is [`DEPLOYMENT.md`](DEPLOYMENT.md). It is public (TLP:CLEAR).

## Further docs

- [`AGENTS.md`](AGENTS.md) — agent conventions and project structure
- [`components/chrome/`](components/chrome/) — shared chrome primitives
- [`e2e/README.md`](e2e/README.md) — test suite notes
