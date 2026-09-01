import { defineConfig, devices } from '@playwright/test';

// BASE_URL is required, deliberately with no default. It used to fall back to
// https://dcyfr.io, which meant a local run with no BASE_URL photographed
// PRODUCTION: the suite passed while saying nothing about the working tree, and
// `test:snapshots:update` in that state would have overwritten every baseline
// with a picture of the live site. CI always sets it explicitly
// (visual-regression.yml resolves the Vercel preview target_url), so failing
// closed costs CI nothing and only removes the silent local footgun.
const baseURL = process.env.BASE_URL;
if (!baseURL) {
  throw new Error(
    'BASE_URL is required and is not defaulted.\n' +
      '  local build:  npx next build && npx next start -p 3100\n' +
      '                BASE_URL=http://localhost:3100 npm run test:snapshots\n' +
      '  preview:      BASE_URL=<vercel preview url> npm run test:snapshots\n' +
      'The old default pointed at production, so a local run passed against ' +
      'the live site instead of your changes.',
  );
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  // Drop {projectName} and {platform} from snapshot paths so baselines
  // captured on macOS match what CI renders on Linux. The 5% tolerance
  // (maxDiffPixelRatio: 0.05 in e2e/snapshots.spec.ts) absorbs the
  // per-OS font/anti-aliasing delta. If false positives emerge, switch
  // to a per-OS capture strategy (CI-driven baseline generation).
  //
  // IMPORTANT: baselines should be (re)generated from the x86 CI runner for
  // BOTH viewports. Procedure: push the change, let this gate fail, download
  // the failed run's `playwright-report` artifact, and commit its
  // `<name>-actual.png` as the new `<name>.png` (the artifact is the exact x86
  // render).
  //
  // Mobile (375px) has no alternative: at narrow width text wraps differently
  // between arm64 and x86, shifting the fullPage height by ~20px — a hard
  // size-mismatch that no tolerance can absorb.
  //
  // Desktop (1440px) does not size-mismatch, but a local arm64 capture is NOT
  // equivalent to CI's. Measured 2026-08-31 on an otherwise pixel-identical
  // build: 57,426 differing pixels, ratio 0.0125, all of it text-edge
  // antialiasing (arm64 renders glyphs grayscale where the runner renders them
  // subpixel; ink extents match within 0.3% and nothing shifts). It passes only
  // because the tolerance absorbs it — so committing a local desktop baseline
  // silently spends a quarter of the 5% budget on platform noise and leaves
  // that much less headroom for a real regression.
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{ext}',
  use: {
    baseURL,
    trace: 'on-first-retry',
    // Vercel Protection Bypass for Automation. Without these headers, Playwright
    // hits the Vercel SSO login wall on protected preview deploys instead of the
    // site. Header bypass + cookie bypass together cover both fetch + navigation.
    // https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation
    extraHTTPHeaders: process.env.VERCEL_AUTOMATION_BYPASS_SECRET
      ? {
          'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
          'x-vercel-set-bypass-cookie': 'true',
        }
      : undefined,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
