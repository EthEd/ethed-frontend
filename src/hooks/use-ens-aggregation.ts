'use client';

import { useState, useEffect, useCallback } from 'react';

interface ENSData {
  ensName: string | null;
  ensAvatar: string | null;
  address: string | null;
  records: Record<string, string>;
  loading: boolean;
  error: string | null;
}

/**
 * useENSAggregation
 * Aggregates ENS data for a given wallet address or ENS name.
 * Fetches from the local API which handles on-chain + database resolution.
 */
export function useENSAggregation(addressOrName?: string | null): ENSData {
  const [data, setData] = useState<ENSData>({
    ensName: null,
    ensAvatar: null,
    address: null,
    records: {},
    loading: false,
    error: null,
  });

  const resolve = useCallback(async (input: string) => {
    setData((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Determine if input is an address or ENS name
      const isAddress = input.startsWith('0x') && input.length === 42;
      const param = isAddress ? `address=${encodeURIComponent(input)}` : `name=${encodeURIComponent(input)}`;
      const res = await fetch(`/api/ens/lookup?${param}`);
      const json = await res.json();

      if (json.error) {
        setData({
          ensName: input.endsWith('.eth') ? input : null,
          ensAvatar: null,
          address: isAddress ? input : null,
          records: {},
          loading: false,
          error: json.error,
        });
      } else {
        setData({
          ensName: json.ensName || null,
          ensAvatar: json.ensAvatar || null,
          address: json.address || (isAddress ? input : null),
          records: {},
          loading: false,
          error: null,
        });
      }
    } catch (err) {
      setData((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to resolve ENS',
      }));
    }
  }, []);

  useEffect(() => {
    if (!addressOrName) return;
    resolve(addressOrName);
  }, [addressOrName, resolve]);

  return data;
}

/**
 * useENSBatch
 * Resolve multiple addresses/names in parallel.
 */
export function useENSBatch(inputs: (string | null | undefined)[]) {
  const [results, setResults] = useState<Record<string, { ensName: string | null; avatar: string | null }>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const validInputs = inputs.filter(Boolean) as string[];
    if (validInputs.length === 0) return;

    setLoading(true);

    Promise.all(
      validInputs.map(async (input) => {
        try {
          const isAddress = input.startsWith('0x') && input.length === 42;
          const param = isAddress ? `address=${encodeURIComponent(input)}` : `name=${encodeURIComponent(input)}`;
          const res = await fetch(`/api/ens/lookup?${param}`);
          const json = await res.json();
          return {
            key: input,
            ensName: json.ensName || null,
            avatar: json.ensAvatar || null,
          };
        } catch {
          return { key: input, ensName: null, avatar: null };
        }
      })
    ).then((resolved) => {
      const map: Record<string, { ensName: string | null; avatar: string | null }> = {};
      for (const r of resolved) {
        map[r.key] = { ensName: r.ensName, avatar: r.avatar };
      }
      setResults(map);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(inputs)]);

  return { results, loading };
}
