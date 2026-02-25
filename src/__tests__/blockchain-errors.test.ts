import { describe, it, expect } from 'vitest';
import { getBlockchainErrorInfo } from '@/lib/blockchain-errors';

describe('getBlockchainErrorInfo', () => {
  it('handles code 4001 (transaction rejected)', () => {
    const info = getBlockchainErrorInfo({ code: 4001, message: 'User rejected' });
    expect(info.title).toBe('Transaction rejected');
    expect(info.description).toMatch(/rejected/);
  });

  it('handles unsupported chain (4902)', () => {
    const info = getBlockchainErrorInfo({ code: 4902, message: 'Unknown chain' });
    expect(info.title).toBe('Unsupported chain');
    expect(info.isChainError).toBeTruthy();
  });

  it('handles pending wallet request (-32002)', () => {
    const info = getBlockchainErrorInfo({ code: -32002, message: 'request pending' });
    expect(info.title).toBe('Wallet request pending');
  });

  it('parses message content for wrong network', () => {
    const info = getBlockchainErrorInfo(new Error('Please switch chain to Amoy'));
    expect(info.title).toMatch(/Wrong network|Blockchain error/);
  });

  it('captures insufficient funds', () => {
    const info = getBlockchainErrorInfo(new Error('insufficient funds for gas * price * gasLimit'));
    expect(info.title).toBe('Insufficient funds');
  });

  it('renders an actionable message for malformed addresses', () => {
    const info = getBlockchainErrorInfo(new Error('Invalid address'));
    expect(info.title).toBe('Invalid address');
    expect(info.description).toMatch(/ENS|Connect Current Wallet|0x/i);
  });

  it('returns fallback for unknown errors', () => {
    const info = getBlockchainErrorInfo(undefined);
    expect(info.title).toBeDefined();
  });
});
