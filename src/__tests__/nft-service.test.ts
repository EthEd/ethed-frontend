/** @vitest-environment node */

import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

// Import module under test
import {
  generateGenesisScholarMetadata,
  uploadMetadataToIPFS,
  mintOnChain,
} from '@/lib/nft-service';


describe('nft-service', () => {
  beforeEach(() => {
    // Ensure test env uses development defaults
    (process.env as any).NODE_ENV = 'test';
    // Make sure PINATA_JWT is unset so uploadMetadataToIPFS uses the dev fallback
    delete process.env.PINATA_JWT;
  });

  it('generateGenesisScholarMetadata includes ENS attribute when provided', () => {
    const md = generateGenesisScholarMetadata('ipfs://QmCid', 'alice.eth');
    const hasEns = md.attributes.some((a) => a.trait_type === 'ENS Name' && a.value === 'alice.eth');
    expect(hasEns).toBe(true);
    expect(md.image).toBe('ipfs://QmCid');
  });

  it('uploadMetadataToIPFS writes local metadata file when Pinata not configured', async () => {
    const metadata = {
      name: 'Test NFT',
      description: 'test',
      image: '/og-image.png',
      attributes: [],
    } as any;

    const uri = await uploadMetadataToIPFS(metadata);

    // Should return a local path under /local-metadata
    expect(uri).toMatch(/^\/local-metadata\//);

    const filename = uri.replace('/local-metadata/', '');
    const filePath = path.join(process.cwd(), 'public', 'local-metadata', filename);

    expect(fs.existsSync(filePath)).toBe(true);

    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    expect(content.name).toBe('Test NFT');
  });

  it('mintOnChain returns mock result when on-chain env vars are not set', async () => {
    // Ensure on-chain envs are not present
    delete process.env.AMOY_RPC_URL;
    delete process.env.DEPLOYER_PRIVATE_KEY;

    const res = await mintOnChain('0x0000000000000000000000000000000000000001', '/metadata/1.json', 'pioneer');

    expect(res.tokenId).toMatch(/^mock-/);
    expect(res.txHash).toMatch(/^0x0+/);
    expect(res.contractAddress).toBeDefined();
  });
});
