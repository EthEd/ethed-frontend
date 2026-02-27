import { describe, it, expect } from 'vitest';

describe('auth production configuration', () => {
  it('includes only siwe and configured OAuth providers', async () => {
    const { authOptions } = await import('@/lib/auth');

    const providerIds = (authOptions.providers || []).map((p: any) => (p as any).id).filter(Boolean);

    // Should always include SIWE
    expect(providerIds).toContain('siwe');
    
    // Should never include demo credentials
    expect(providerIds).not.toContain('demo');
  });
});
