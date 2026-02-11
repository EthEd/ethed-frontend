import { describe, it, expect } from 'vitest';
import { validateSubdomain } from '@/lib/ens-service';

describe('ens-service', () => {
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
});
