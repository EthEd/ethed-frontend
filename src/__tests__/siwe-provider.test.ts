import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateSubdomain } from '@/lib/ens-service';

// Note: Full SIWE provider testing requires mocking NextAuth internals
// For now, we test the ENS validation that SIWE depends on

describe('SIWE Integration (ENS validation)', () => {
  it('should validate SIWE message format requirements (via ENS subdomain validation)', () => {
    // SIWE messages must include a valid address/domain
    // We test the subdomain validation that occurs during SIWE sign-in
    const result = validateSubdomain('validsiweuser');
    expect(result.valid).toBe(true);
  });

  it('rejects invalid subdomain in SIWE context', () => {
    const result = validateSubdomain('');
    expect(result.valid).toBe(false);
  });
});

