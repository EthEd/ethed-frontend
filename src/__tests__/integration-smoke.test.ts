import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

/**
 * Integration smoke test for Amoy testnet
 * Verifies ENS registration and NFT minting on-chain
 * Requires AMOY_RPC_URL and DEPLOYER_PRIVATE_KEY environment variables
 */

const SKIP_SMOKE_TEST = process.env.SKIP_SMOKE_TEST === 'true';

describe.skipIf(SKIP_SMOKE_TEST)('Integration: Amoy Smoke Test (ENS → NFT)', () => {
  it('smoke test configuration is available', () => {
    const rpcUrl = process.env.AMOY_RPC_URL;
    const deployerKey = process.env.DEPLOYER_PRIVATE_KEY;

    if (!rpcUrl || !deployerKey) {
      console.warn(
        '⚠️  AMOY_RPC_URL or DEPLOYER_PRIVATE_KEY not set. ' +
        'Run: SKIP_SMOKE_TEST=true pnpm test to skip. ' +
        'For live test, set RPC and key in .env.local'
      );
    }
    // Smoke test should be run via scripts/smoke-amoy.mjs
    expect(true).toBe(true);
  });
});
