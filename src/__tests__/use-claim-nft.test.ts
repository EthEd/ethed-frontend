import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useClaimNFT } from '@/hooks/use-claim-nft';
import { toast } from 'sonner';

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('useClaimNFT', () => {
  const fetchMock = vi.fn();
  global.fetch = fetchMock;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully claim an NFT', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ nft: { name: 'EIPs 101 Badge' } }),
    });

    const { result } = renderHook(() => useClaimNFT());

    await result.current.claimNFT('eips-101');

    expect(fetchMock).toHaveBeenCalledWith('/api/user/course/claim-nft', expect.any(Object));
    await waitFor(() => {
      expect(result.current.claimed).toBe(true);
    });
    expect(toast.success).toHaveBeenCalledWith('🎉 NFT claimed successfully!', expect.any(Object));
  });

  it('should handle "already claimed" response', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'already claimed', error: 'Already claimed' }),
    });

    const { result } = renderHook(() => useClaimNFT());

    await result.current.claimNFT('eips-101');

    await waitFor(() => {
      expect(result.current.claimed).toBe(true);
    });
    expect(toast.info).toHaveBeenCalledWith('NFT already claimed', expect.any(Object));
  });

  it('should handle generic errors', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Insufficient permissions' }),
    });

    const { result } = renderHook(() => useClaimNFT());

    await result.current.claimNFT('eips-101');

    expect(result.current.claimed).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Failed to claim NFT', expect.any(Object));
  });

  it('should handle network errors', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network failure'));

    const { result } = renderHook(() => useClaimNFT());

    await result.current.claimNFT('eips-101');

    expect(result.current.claimed).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Failed to claim NFT', {
      description: 'Network error. Please try again.'
    });
  });
});
