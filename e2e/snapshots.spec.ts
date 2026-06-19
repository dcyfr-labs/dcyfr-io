import { test, expect } from '@playwright/test';

/**
 * Visual regression baseline per
 * openspec/changes/dcyfr-skeleton-sites-scaffolding/spec.md#51-screenshot-baseline
 *
 * First-run flow: `npm run test:snapshots -- --update-snapshots` captures
 * baselines into e2e/snapshots/. Commit the resulting PNGs. Subsequent
 * preview deploys diff against them; failures flag visual regressions.
 *
 * dcyfr.io is a portal site — minimal route surface. Two views covered:
 * - `/` home (full portal)
 * - `/#products` anchored to product grid (hash scroll is the primary interior affordance)
 *
 * Both captured at desktop (1440×900) and mobile (375×812). Motion paused to
 * avoid flakiness on the Phase-3 chip pulse + card hover transitions. The
 * RSS-driven blog carousel is hidden before capture (see inline note below) so
 * dcyfr.tech publishing a new article can't drift these baselines.
 */

const VIEWPORTS = [
  { width: 1440, height: 900, name: 'desktop' },
  { width: 375, height: 812, name: 'mobile' },
] as const;

const ROUTES = [
  { path: '/', name: 'home' },
  { path: '/#products', name: 'products-anchor' },
] as const;

for (const route of ROUTES) {
  for (const vp of VIEWPORTS) {
    test(`${route.name} @ ${vp.name}`, async ({ page }) => {
      // `colorScheme: 'dark'` locks baselines to dark-mode render so the
      // palette-class migration (2026-04-18) stays a pure visual refactor.
      // Light-mode capture is a follow-up (dcyfr-palette-class-migration
      // spec §2.2 notes theme-responsive activation as a separate concern).
      await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // `domcontentloaded` instead of `load` — Vercel analytics + external RSS
      // fetches never settle into `networkidle` on this page. We care about
      // rendered markup, not background telemetry beacons.
      await page.goto(route.path, { waitUntil: 'domcontentloaded' });

      // Let hydration + font-swap + layout settle before snapshot
      await page.waitForTimeout(1500);

      // Exclude the RSS-driven blog carousel from the capture. app/page.tsx
      // hydrates `section[aria-labelledby="blog-heading"]` (BlogCarousel) from
      // dcyfr.tech's live feed; its cards have no fixed height, so a new
      // article changes the section's height and drifts this fullPage snapshot
      // into a size-mismatch hard-fail. The feed is inherently dynamic — not a
      // stable visual baseline — so hide it. `display:none` is a no-op when the
      // feed failed to render (vs `mask:`, which would still leave a
      // variable-height box). Both `/` and `/#products` render it.
      await page.addStyleTag({
        content:
          'section[aria-labelledby="blog-heading"]{display:none !important}',
      });

      await expect(page).toHaveScreenshot(`${route.name}-${vp.name}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.05,
        animations: 'disabled',
      });
    });
  }
}
