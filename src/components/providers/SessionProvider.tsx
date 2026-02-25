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

const SWITCH_MAX_ATTEMPTS = 3;
const SWITCH_BASE_DELAY_MS = 400;

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function ChainSwitcher({ children }: Props) {
  const { status } = useSession();

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) {
      return;
    }

    let mounted = true;

    const requestSwitch = async () => {
      try {
        const initialChainId = await getWalletChainId();
        if (!mounted) return;

        if (initialChainId === null || initialChainId === AMOY_CHAIN_ID) {
          return;
        }

        for (let attempt = 1; attempt <= SWITCH_MAX_ATTEMPTS; attempt++) {
          try {
            await ensureAmoyChain();

            if (!mounted) return;

            const config = getChainConfig(AMOY_CHAIN_ID);
            toast.success("Wallet connected", {
              description: `Switched to ${config.name}.`,
            });

            return;
          } catch (error) {
            if (!mounted) return;

            const info = getBlockchainErrorInfo(error);
            const isLastAttempt = attempt === SWITCH_MAX_ATTEMPTS;
            const isUserAction = info.code === 4001;
            const isPending = info.code === -32002;
            const isChainIssue = info.isChainError === true;

            if (isUserAction || isPending || isChainIssue || isLastAttempt) {
              toast.error(info.title, {
                description: info.description,
              });
              return;
            }

            await sleep(SWITCH_BASE_DELAY_MS * 2 ** (attempt - 1));
          }
        }
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