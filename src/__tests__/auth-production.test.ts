import { describe, it, expect, vi } from 'vitest';

describe('auth production configuration', () => {
  it('does not include demo credentials provider in production', async () => {
    const original = process.env.NODE_ENV;
    (process.env as any).NODE_ENV = 'production';

    // Clear module cache and re-import
    vi.resetModules();
    const { authOptions } = await import('@/lib/auth');

    const providerIds = (authOptions.providers || []).map((p: any) => (p as any).id).filter(Boolean);

    expect(providerIds).not.toContain('demo');

    // restore
    (process.env as any).NODE_ENV = original;
    vi.resetModules();
  });
});
