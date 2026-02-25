import { describe, it, expect } from 'vitest';
import { GENESIS_PIONEER_IMAGE_URI, GENESIS_PIONEER_METADATA_URI } from '@/lib/genesis-assets';

describe('genesis assets', () => {
  it('requires genesis image to be pinned or PINATA_JWT present (enforced in CI/production)', () => {
    const placeholder = 'ipfs://QmEthEdPioneer1' as string;
    const pinned = typeof GENESIS_PIONEER_IMAGE_URI === 'string' && GENESIS_PIONEER_IMAGE_URI !== placeholder;

    // Only enforce pinning in CI or production builds; local dev uses a bundled fallback image.
    const strict = process.env.CI === 'true' || process.env.NODE_ENV === 'production';
    expect(strict ? (pinned || !!process.env.PINATA_JWT) : true).toBeTruthy();
  });

  it('genesis metadata URI should be empty (dev) or an ipfs:// URI', () => {
    expect(
      GENESIS_PIONEER_METADATA_URI === '' || /^ipfs:\/\//.test(GENESIS_PIONEER_METADATA_URI)
    ).toBeTruthy();
  });
});
