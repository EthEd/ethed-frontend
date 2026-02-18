import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock prisma for the availability checks
const prismaMocks = vi.hoisted(() => ({
  walletAddress: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('@/lib/prisma-client', () => ({ prisma: prismaMocks }));

import { validateSubdomain, checkAvailability, registerOnChain } from '@/lib/ens-service';
import { prisma } from '@/lib/prisma-client';

describe('ens-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateSubdomain', () => {
    it('rejects empty subdomain', () => {
      const result = validateSubdomain('');
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/required/i);
    });

    it('rejects subdomain shorter than 3 chars', () => {
      const result = validateSubdomain('ab');
      expect(result.valid).toBe(false);
    });

    it('rejects subdomain longer than 20 chars', () => {
      const result = validateSubdomain('a'.repeat(21));
      expect(result.valid).toBe(false);
    });

    it('accepts uppercase (auto-converted to lowercase)', () => {
      const result = validateSubdomain('Test123');
      expect(result.valid).toBe(true);
    });

    it('rejects invalid characters (special chars)', () => {
      const result = validateSubdomain('test@123');
      expect(result.valid).toBe(false);
    });

    it('rejects reserved names', () => {
      const result = validateSubdomain('admin');
      expect(result.valid).toBe(false);
    });

    it('accepts valid subdomain', () => {
      const result = validateSubdomain('myname123');
      expect(result.valid).toBe(true);
    });

    it('accepts valid subdomain with hyphens', () => {
      const result = validateSubdomain('my-valid-name');
      expect(result.valid).toBe(true);
    });

    it('rejects starting with hyphen', () => {
      const result = validateSubdomain('-name');
      expect(result.valid).toBe(false);
    });

    it('rejects ending with hyphen', () => {
      const result = validateSubdomain('name-');
      expect(result.valid).toBe(false);
    });

    it('rejects consecutive hyphens', () => {
      const result = validateSubdomain('na--me');
      expect(result.valid).toBe(false);
    });
  });

  describe('availability & on-chain fallbacks', () => {
    it('checkAvailability returns true when not found and false when exists', async () => {
      (prisma.walletAddress.findFirst as any).mockResolvedValueOnce(null);
      const available = await checkAvailability('alice', 'ethed.eth');
      expect(available).toBe(true);

      (prisma.walletAddress.findFirst as any).mockResolvedValueOnce({ id: 'w1' });
      const notAvailable = await checkAvailability('alice', 'ethed.eth');
      expect(notAvailable).toBe(false);
    });

    it('registerOnChain returns dev-mock tx when on-chain env not configured', async () => {
      const res = await registerOnChain('bob', '0x0000000000000000000000000000000000000001', 'ethed.eth');
      expect(res.ensName).toBe('bob.ethed.eth');
      expect(res.txHash).toMatch(/^0x0+/);
      expect(res.explorerUrl).toBeNull();
    });
  });
});
