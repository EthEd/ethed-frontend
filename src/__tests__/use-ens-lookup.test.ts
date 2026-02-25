import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useENSLookup } from '@/hooks/use-ens-lookup';

// Mock fetch globally
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('useENSLookup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('lookupByAddress', () => {
    it('should return null for empty address', async () => {
      const { result } = renderHook(() => useENSLookup());

      const data = await result.current.lookupByAddress('');

      expect(data).toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should fetch ENS data for valid address', async () => {
      const mockData = {
        ensName: 'test.ayushetty.eth',
        address: '0x123...',
        cached: false
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData)
      });

      const { result } = renderHook(() => useENSLookup());

      const data = await result.current.lookupByAddress('0x123456789');

      expect(fetchMock).toHaveBeenCalledWith('/api/ens/lookup?address=0x123456789');
      expect(data).toEqual(mockData);
    });

    it('should handle fetch errors', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useENSLookup());

      const data = await result.current.lookupByAddress('0x123456789');

      expect(data).toBeNull();
      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });
    });
  });

  describe('lookupByName', () => {
    it('should return null for empty name', async () => {
      const { result } = renderHook(() => useENSLookup());

      const data = await result.current.lookupByName('');

      expect(data).toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should fetch address data for valid ENS name', async () => {
      const mockData = {
        address: '0x123456789',
        ensName: 'test.ayushetty.eth',
        cached: true
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData)
      });

      const { result } = renderHook(() => useENSLookup());

      const data = await result.current.lookupByName('test.ayushetty.eth');

      expect(fetchMock).toHaveBeenCalledWith('/api/ens/lookup?name=test.ayushetty.eth');
      expect(data).toEqual(mockData);
    });
  });
});