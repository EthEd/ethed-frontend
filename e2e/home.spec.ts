import { test, expect } from '@playwright/test';

test('homepage loads and learn page reachable', async ({ page, request }) => {
  // Home
  await page.goto('/');
  await expect(page.locator('text=Master Web3')).toBeVisible();

  // Navigate to Learn
  await page.locator('a[href="/learn"]').first().click();
  await expect(page).toHaveURL(/\/learn/);
  await expect(page.locator('text=Learning Paths')).toBeVisible();
});