'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Award, ExternalLink, Gem, Loader2, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface NFTEntry {
  id: string;
  name: string;
  image: string;
  tokenId: string;
  contractAddress: string | null;
  chainId: number | null;
  transactionHash: string | null;
  mintedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

interface PaginatedResponse {
  nfts: NFTEntry[];
  total: number;
  page: number;
  totalPages: number;
}

const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum',
  137: 'Polygon',
  80002: 'Amoy',
  11155111: 'Sepolia',
};

export default function AdminNFTsPage() {
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchNFTs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set('q', search);
    const res = await fetch(`/api/admin/nfts?${params}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchNFTs(); }, [fetchNFTs]);
  useEffect(() => { setPage(1); }, [search]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Gem className="h-5 w-5 text-indigo-400" />
          <h1 className="text-2xl font-bold text-white">NFT Management</h1>
        </div>
        <p className="text-slate-400 text-sm">All NFTs minted on the platform.</p>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={e => { setSearch(e.target.value); }}
            placeholder="Search by user name or email…"
            className="pl-9 bg-slate-900/60 border-white/10 text-white placeholder:text-slate-500"
          />
        </div>
        <span className="text-slate-400 text-sm self-center">
          {data?.total ?? 0} total
        </span>
      </div>

      {/* Table */}
      <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
            </div>
          ) : data?.nfts.length === 0 ? (
            <div className="text-center py-16 text-slate-500 flex flex-col items-center gap-3">
              <Award className="h-10 w-10 opacity-30" />
              No NFTs found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 text-xs uppercase">
                    <th className="text-left px-4 py-3">NFT</th>
                    <th className="text-left px-4 py-3">Owner</th>
                    <th className="text-left px-4 py-3">Token</th>
                    <th className="text-left px-4 py-3">Chain</th>
                    <th className="text-left px-4 py-3">Minted</th>
                    <th className="text-left px-4 py-3">Tx</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.nfts.map(nft => (
                    <tr key={nft.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {nft.image ? (
                            <Image
                              src={nft.image}
                              alt={nft.name}
                              width={40}
                              height={40}
                              className="rounded-lg border border-white/10 object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
                              <Award className="h-5 w-5 text-indigo-400" />
                            </div>
                          )}
                          <p className="text-white font-medium">{nft.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/users/${nft.user.id}`}
                          className="group flex items-center gap-2"
                        >
                          {nft.user.image ? (
                            <Image
                              src={nft.user.image}
                              alt={nft.user.name ?? ''}
                              width={24}
                              height={24}
                              className="rounded-full border border-white/10 shrink-0"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-300 shrink-0">
                              {(nft.user.name ?? nft.user.email ?? '?')[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-white text-xs font-medium group-hover:text-cyan-400 transition-colors">
                              {nft.user.name ?? '—'}
                            </p>
                            <p className="text-slate-500 text-xs">{nft.user.email}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-slate-400 text-xs">#{nft.tokenId}</code>
                        {nft.contractAddress && (
                          <p className="text-slate-600 text-xs font-mono">
                            {nft.contractAddress.slice(0, 8)}…{nft.contractAddress.slice(-6)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {nft.chainId ? (
                          <Badge variant="outline" className="text-slate-300 border-white/10 text-xs">
                            {CHAIN_NAMES[nft.chainId] ?? `Chain ${nft.chainId}`}
                          </Badge>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {nft.mintedAt ? new Date(nft.mintedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {nft.transactionHash ? (
                          <a
                            href={
                              nft.chainId === 137
                                ? `https://polygonscan.com/tx/${nft.transactionHash}`
                                : nft.chainId === 80002
                                ? `https://amoy.polygonscan.com/tx/${nft.transactionHash}`
                                : `https://etherscan.io/tx/${nft.transactionHash}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 text-xs"
                          >
                            View <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-slate-400">
          <span>{data.total} NFTs total</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="border-white/10 text-slate-300 bg-white/5"
            >
              Previous
            </Button>
            <span className="px-3 py-1.5 text-slate-300">Page {page} / {data.totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === data.totalPages}
              onClick={() => setPage(p => p + 1)}
              className="border-white/10 text-slate-300 bg-white/5"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
