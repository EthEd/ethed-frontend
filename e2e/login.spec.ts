import { test, expect } from '@playwright/test';

test('login page loads and SIWE button present', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('text=Sign in to start your Web3 learning journey')).toBeVisible();
  await expect(page.getByRole('button', { name: /Sign In with Ethereum/i })).toBeVisible();
});
