import { test, expect } from '@playwright/test';

test('homepage loads and learn page reachable', async ({ page }) => {
  // Home
  await page.goto('/');
  // Heading updated — assert current hero copy
  await expect(page.locator('text=Get Rewarded for Learning')).toBeVisible();

  // Navigate to Learn (click hero "Browse Courses" link which is less ambiguous)
  const browseLink = page.getByRole('link', { name: /Browse Courses/i });
  await expect(browseLink).toBeVisible({ timeout: 5000 });
  // click and wait for navigation — use force to avoid intermittent overlay/flakiness
  await Promise.all([
    page.waitForURL(/\/learn/, { timeout: 10000 }),
    browseLink.click({ force: true }),
  ]);
  // Use a role-based locator to avoid ambiguous matches
  await expect(page.getByRole('heading', { name: /Learning Paths/i })).toBeVisible();
});