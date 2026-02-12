import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    include: ['src/__tests__/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    isolate: true,
    testTimeout: 15000,
    hookTimeout: 10000,
    retry: 1,
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});