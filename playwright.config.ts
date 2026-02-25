import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['dot'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001',
    headless: true,
    actionTimeout: 0,
    trace: 'on-first-retry',
  },

  // Start Next.js dev server automatically when running e2e locally
  webServer: {
    command: 'PORT=3001 npm run dev',
    port: 3001,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});