"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { ReactNode, useEffect } from "react";
import { toast } from "sonner";
import { AMOY_CHAIN_ID, getChainConfig } from "@/lib/contracts";
import { getBlockchainErrorInfo } from "@/lib/blockchain-errors";
import { ensureAmoyChain, getWalletChainId } from "@/lib/wallet-client";
import BlockchainErrorBoundary from "@/components/BlockchainErrorBoundary";

interface Props {
  children: ReactNode;
}

function ChainSwitcher({ children }: Props) {
  const { status } = useSession();

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) {
      return;
    }

    let mounted = true;

    const requestSwitch = async () => {
      try {
        await ensureAmoyChain();

        if (!mounted) return;

        const config = getChainConfig(AMOY_CHAIN_ID);
        toast.success("Wallet connected", {
          description: `Switched to ${config.name}.`,
        });
      } catch (error) {
        const info = getBlockchainErrorInfo(error);
        toast.error(info.title, {
          description: info.description,
        });
      }
    };

    if (status === "authenticated") {
      requestSwitch();
    }

    const handleChainChanged = async (chainIdHex: string) => {
      const nextChainId = parseInt(chainIdHex, 16);
      if (nextChainId !== AMOY_CHAIN_ID) {
        const config = getChainConfig(AMOY_CHAIN_ID);
        toast.warning("Wrong network", {
          description: `Switch to ${config.name} to continue.`,
        });
      } else {
        const config = getChainConfig(AMOY_CHAIN_ID);
        toast.success("Network updated", {
          description: `Connected to ${config.name}.`,
        });
      }
    };

    const handleAccountsChanged = async () => {
      const chainId = await getWalletChainId();
      if (chainId && chainId !== AMOY_CHAIN_ID) {
        const config = getChainConfig(AMOY_CHAIN_ID);
        toast.warning("Wrong network", {
          description: `Switch to ${config.name} to continue.`,
        });
      }
    };

    if (window.ethereum) {
      (window.ethereum as any)?.on?.("chainChanged", handleChainChanged);
      (window.ethereum as any)?.on?.("accountsChanged", handleAccountsChanged);
    }

    return () => {
      mounted = false;
      if (window.ethereum) {
        (window.ethereum as any)?.removeListener?.("chainChanged", handleChainChanged);
        (window.ethereum as any)?.removeListener?.("accountsChanged", handleAccountsChanged);
      }
    };
  }, [status]);

  return <>{children}</>;
}

export default function NextAuthSessionProvider({ children }: Props) {
  return (
    <SessionProvider>
      <BlockchainErrorBoundary>
        <ChainSwitcher>{children}</ChainSwitcher>
      </BlockchainErrorBoundary>
    </SessionProvider>
  );
}