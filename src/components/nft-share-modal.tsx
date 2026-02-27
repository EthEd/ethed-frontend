'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Copy, Check, ExternalLink, Share2, Twitter, Link2 } from 'lucide-react';
import Image from 'next/image';
import { ipfsToGatewayUrl } from '@/lib/ipfs';
import { getExplorerTxUrl } from '@/lib/contracts';

interface NFTShareModalProps {
  nft: {
    id: string;
    name: string;
    description?: string | null;
    image: string | null;
    tokenId: string | null;
    metadata: Record<string, unknown> | string | null;
    contractAddress?: string | null;
    transactionHash?: string | null;
    chainId?: number | null;
    createdAt: string;
  };
  open: boolean;
  onClose: () => void;
}

export default function NFTShareModal({ nft, open, onClose }: NFTShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [isPinning, setIsPinning] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/nft/${nft.id}`
    : `/nft/${nft.id}`;

  const ipfsUrl = nft.metadata && typeof nft.metadata === 'string' && nft.metadata.startsWith('ipfs://')
    ? ipfsToGatewayUrl(nft.metadata)
    : null;

  // Only show explorer link for real (non-zero) transactions
  const isRealTx = nft.transactionHash && !/^0x0+$/.test(nft.transactionHash);
  const explorerUrl = isRealTx && nft.chainId
    ? getExplorerTxUrl(nft.chainId, nft.transactionHash!)
    : null;

  // Parse "CourseName - RecipientName - Learning Sprout" into parts
  const isMockToken = nft.tokenId?.startsWith('mock-') ?? false;
  const nameParts = nft.name.split(' - ');
  const nftType = nameParts[nameParts.length - 1] ?? 'NFT'; // "Learning Sprout"
  const recipient = nameParts.length >= 3 ? nameParts[nameParts.length - 2] : null;
  const courseName = nameParts.length >= 2
    ? nameParts.slice(0, nameParts.length >= 3 ? -2 : -1).join(' - ')
    : nft.name;
  const description = (nft.metadata && typeof nft.metadata === 'object' && 'description' in nft.metadata
    ? (nft.metadata as Record<string, unknown>).description as string
    : nft.description) ?? null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`I just earned the "${courseName}" NFT on @ethed_app! 🎉🏆\n\nLearn blockchain & earn verifiable NFT credentials:\n${shareUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handlePinToIPFS = async () => {
    setIsPinning(true);
    try {
      const res = await fetch('/api/user/nft/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nftId: nft.id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('NFT metadata pinned to IPFS!', { description: `CID: ${data.cid}` });
      } else {
        toast.error('Failed to pin to IPFS', { description: data.error });
      }
    } catch {
      toast.error('Failed to pin to IPFS');
    } finally {
      setIsPinning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o: boolean) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Share NFT
          </DialogTitle>
          <DialogDescription>Share your achievement with the world</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* NFT Preview */}
          <div className="rounded-xl bg-muted/30 border border-border/50 p-4">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-purple-500/20 to-primary/20 flex items-center justify-center overflow-hidden relative shrink-0">
                {nft.image ? (
                  <Image src={ipfsToGatewayUrl(nft.image)} alt={nft.name} fill sizes="80px" className="object-cover" />
                ) : (
                  <Share2 className="h-8 w-8 text-purple-400" />
                )}
              </div>
              <div className="min-w-0 space-y-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{nftType}</p>
                <h3 className="font-bold text-foreground leading-tight">{courseName}</h3>
                {recipient && (
                  <p className="text-sm text-muted-foreground">Earned by <span className="text-foreground font-medium">{recipient}</span></p>
                )}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {isMockToken ? (
                    <Badge variant="outline" className="text-xs bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400">
                      Dev Preview
                    </Badge>
                  ) : nft.tokenId ? (
                    <Badge variant="outline" className="text-xs">Token #{nft.tokenId}</Badge>
                  ) : null}
                  {isRealTx && (
                    <Badge variant="outline" className="text-xs bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                      On-Chain ✓
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Share Actions */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 mr-2 text-emerald-500" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? 'Copied!' : 'Copy Share Link'}
            </Button>

            <Button variant="outline" className="w-full justify-start" onClick={handleTwitterShare}>
              <Twitter className="h-4 w-4 mr-2" />
              Share on Twitter
            </Button>

            <Button variant="outline" className="w-full justify-start" onClick={handlePinToIPFS} disabled={isPinning}>
              <Link2 className="h-4 w-4 mr-2" />
              {isPinning ? 'Pinning to IPFS...' : 'Pin Metadata to IPFS'}
            </Button>

            {explorerUrl && (
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Explorer
                </a>
              </Button>
            )}

            {ipfsUrl && (
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href={ipfsUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on IPFS
                </a>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
