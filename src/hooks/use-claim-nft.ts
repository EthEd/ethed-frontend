'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { getBlockchainErrorInfo } from '@/lib/blockchain-errors';

export function useClaimNFT() {
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const claimNFT = async (courseSlug: string) => {
    if (isClaiming || claimed) return;

    setIsClaiming(true);
    try {
      const res = await fetch('/api/user/course/claim-nft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseSlug })
      });

      const data = await res.json();

      if (res.ok) {
        setClaimed(true);
        toast.success('🎉 NFT claimed successfully!', {
          description: `Your ${data.nft?.name} has been minted!`
        });
        return data.nft;
      } else {
        if (data.message?.includes('already claimed')) {
          setClaimed(true);
          toast.info('NFT already claimed', {
            description: 'You already own this NFT badge'
          });
        } else {
          toast.error('Failed to claim NFT', {
            description: data.error || 'Please try again later'
          });
        }
      }
    } catch (err) {
      const info = getBlockchainErrorInfo(err);
      toast.error(info.title, {
        description: info.description || 'Network error. Please try again.'
      });
    } finally {
      setIsClaiming(false);
    }
  };

  return { claimNFT, isClaiming, claimed };
}
