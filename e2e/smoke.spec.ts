import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'https://dcyfr.io';

test.describe('dcyfr.io smoke tests', () => {
  test.describe('desktop (1280×800)', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test('homepage loads and renders hero', async ({ page }) => {
      await page.goto(BASE_URL);
      await expect(page).toHaveTitle(/DCYFR/);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.getByRole('link', { name: /Browse Templates/i })).toBeVisible();
    });

    test('product sections render', async ({ page }) => {
      await page.goto(BASE_URL);
      const products = page.locator('#products');
      await expect(products).toBeVisible();
    });

    test('unified search input is present', async ({ page }) => {
      await page.goto(BASE_URL);
      const searchInput = page.getByRole('combobox').or(page.getByPlaceholder(/search/i));
      await expect(searchInput).toBeVisible();
    });

    test('stats bar shows key metrics', async ({ page }) => {
      await page.goto(BASE_URL);
      // Stats bar should contain numeric values
      await expect(page.getByText('26+')).toBeVisible();
    });

    test('no console errors on homepage', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      await page.goto(BASE_URL);
      expect(errors).toHaveLength(0);
    });
  });

  test.describe('tablet (768×1024)', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test('homepage renders at tablet width', async ({ page }) => {
      await page.goto(BASE_URL);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
  });

  test.describe('mobile (390×844)', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('homepage renders at mobile width', async ({ page }) => {
      await page.goto(BASE_URL);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('no horizontal scroll on mobile', async ({ page }) => {
      await page.goto(BASE_URL);
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
    });
  });
});
