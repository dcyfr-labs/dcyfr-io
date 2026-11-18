# AGENTS.md - dcyfr-io

## What this is

Control-center portal for the DCYFR product ecosystem. Production URL is https://dcyfr.io (package name `dcyfr-io-portal`, dev port 3302). It is one of seven sibling sites built from the `dcyfr-site-scaffold` contract, so layout, tooling and CI match the other `dcyfr-*` site repos. This site also hosts the IndexNow submission endpoints for the whole site family.

## Stack

- Next.js `^16.4.3` (App Router) with React `^19.0.0`, TypeScript `^5`
- Tailwind CSS `^4.3.3` through `@tailwindcss/postcss`; there is no Tailwind config file
- shadcn (`new-york` style) with the `@dcyfr-labs` registry (`https://registry.dcyfr.ai/r/{name}.json`, see `components.json`)
- `@sentry/nextjs` `^10`, `@vercel/analytics`, `@vercel/speed-insights`, `next-themes`
- Playwright `^1.49.0`; ESLint `^9` flat config (`eslint.config.mjs`)

## Directory map

- `app/` : `/` (single-page portal), `/privacy`, `/sitemap-index.xml`, `robots.ts`, `sitemap.ts`, `indexnow.txt`, `.well-known/security.txt`, icons, OG image, theme CSS files
- `app/api/indexnow/webhook` : `POST` receiver for a Vercel team webhook. It returns 401 without a valid `x-vercel-signature`, and submits the sitemap of a mapped host after a successful production deployment.
- `app/api/indexnow/cron` : `GET` backstop that submits every mapped host; requires `Authorization: Bearer $CRON_SECRET`. `vercel.json` schedules it with `0 6 * * 1` (Mondays 06:00 UTC).
- `app/sitemap-index.xml` : index listing 8 sitemaps, including `www.dcyfr.ai`
- `components/` : `BlogCarousel`, `ProductCard`, `UnifiedSearch`, `WorkspaceHealth`
- `components/chrome/` : shared nav, footer, theme provider and toggle (registry-owned)
- `components/ui/` : `button`, `sheet`, `dcyfr-badge`, `dcyfr-button`, `dcyfr-card`
- `lib/` : `indexnow.ts` (holds `PROJECT_HOSTS`, the 8 mapped hosts), `products.ts`, `types.ts`, `utils.ts`
- `hooks/` : `use-dropdown`, `use-media-query`
- `e2e/` : Playwright specs (`smoke`, `contrast`, `snapshots`) and their README
- `eslint-local-rules/` : the five local ESLint rules; `scripts/check-theme-wiring.mjs`
- `proxy.ts` : apex to `www` redirect (Next 16 middleware); `DEPLOYMENT.md` : operational runbook

## Scripts

- `dev` and `start` run `next dev --port 3302` and `next start --port 3302`. `build` runs `next build`, `lint` runs `eslint .`, `typecheck` runs `tsc --noEmit`.
- `test:e2e` runs every Playwright spec in `e2e/`; `test:e2e:ui` opens Playwright UI mode.
- `test:contrast` and `test:snapshots` run one spec each (`e2e/contrast.spec.ts`, `e2e/snapshots.spec.ts`) on chromium. `test:snapshots:update` and `test:snapshots:rebaseline` add `--update-snapshots` and `--update-snapshots=all`.
- `check:theme-wiring` runs `node scripts/check-theme-wiring.mjs`.

## Environment variables

There is no `.env.example`. These are the names the code reads. All are optional locally except `BASE_URL` for Playwright.

- `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN` (falls back to `NEXT_PUBLIC_SENTRY_DSN`)
- `SENTRY_ORG`, `SENTRY_PROJECT` (build-time source maps; default to `dcyfr-labs` and `dcyfr-io`)
- `INDEXNOW_KEY` : served at `/indexnow.txt`; the route returns 404 when it is unset
- `INDEXNOW_WEBHOOK_SECRET` : verifies the webhook signature
- `CRON_SECRET` : bearer token for the cron route
- `VERCEL_ENV`, `NEXT_PUBLIC_VERCEL_ENV`, `NEXT_RUNTIME`, `CI` : set by the platform or CI
- `BASE_URL`, `VERCEL_AUTOMATION_BYPASS_SECRET` : Playwright only

## Testing

- Playwright has no `webServer` block, and `playwright.config.ts` throws when `BASE_URL` is unset (there is no production default here). Start the app and run `BASE_URL=http://localhost:3302 npm run test:e2e`.
- `smoke.spec.ts` checks the hero, product sections, the unified search input, the stats bar and console errors. `contrast.spec.ts` covers `/` and `/privacy`. `snapshots.spec.ts` covers `/` and `/#products` with a 5% `maxDiffPixelRatio`, and hides the `section[aria-labelledby="blog-heading"]` RSS carousel so baselines stay stable.
- Mobile snapshot baselines must be generated on x86 CI. Use the `visual-regression.yml` dispatch with `update_baselines` instead of a local run.
- There is no unit-test runner.

## CI

- `ci.yml`: `typecheck`, `lint` and `build` matrix on Node 20.
- `design-tokens.yml`: palette and primitive-color guards, identity-clobber and theme-wiring checks.
- `visual-regression.yml`: runs on Vercel preview `deployment_status` or dispatch (`base_url`, `update_baselines`); contrast spec, then snapshots (Node 22).
- `codeql.yml`, `semgrep.yml`: weekly (Monday 09:00 UTC), PRs and pushes to `main`; Semgrep needs `SEMGREP_APP_TOKEN`. The Dependabot auto-merge workflows handle dependency PRs.

The `main protection` ruleset requires the `lint`, `typecheck` and `build` checks.

## Design system rules

- Colors, spacing, radii and type come from CSS variables and the vendored `app/dcyfr-theme-*.css` and `app/dcyfr-chrome.css` files. `app/layout.tsx` sets `data-identity="slate"` on `<html>`, and `npm run check:theme-wiring` verifies that wiring.
- ESLint errors: `no-hardcoded-colors`, `no-deprecated-design-tokens`, `no-legacy-dcyfr-palette`. `no-hardcoded-spacing` and `no-hardcoded-typography` are `off` in `eslint.config.mjs`.
- Add primitives with the shadcn CLI and the `@dcyfr-labs` registry instead of writing parallel copies.

## Conventions and gotchas

- `components/chrome/` is owned by the registry bundle. Update it by re-running the registry add command instead of editing the files.
- `proxy.ts` redirects `dcyfr.io` to `www.dcyfr.io` with a 308 and security headers. It stays inert while the Vercel project-level apex redirect exists. `metadataBase` is the apex URL.
- The sitemap list in `app/sitemap-index.xml/route.ts` (`TLD_SITEMAPS`) and `PROJECT_HOSTS` in `lib/indexnow.ts` are separate lists. Update both when a site joins the family.
- Keep portal navigation and product links coherent across the page.
