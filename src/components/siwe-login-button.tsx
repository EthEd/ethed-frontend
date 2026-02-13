"use client";

import { useState, useMemo } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Wallet, Smartphone } from "lucide-react";
import { SiweMessage } from "siwe";
import { toast } from "sonner";
import { AMOY_CHAIN_ID, getChainConfig } from "@/lib/contracts";
import { getBlockchainErrorInfo } from "@/lib/blockchain-errors";
import { ensureAmoyChain, getWalletChainId } from "@/lib/wallet-client";

/**
 * Strip zero-width characters, smart quotes, non-ASCII whitespace that
 * mobile keyboards / copy-paste inject.
 */
function sanitizeAddress(raw: string): string {
  return raw
    .replace(/[\u200B-\u200D\uFEFF\u00AD\u2060\u180E]/g, "")
    .replace(/[\u2018\u2019\u201C\u201D]/g, "")
    .replace(/[\s\u00A0]+/g, " ")
    .trim();
}

function isMobileBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function metamaskDeepLink(): string {
  if (typeof window === "undefined") return "https://metamask.io/download/";
  const dappUrl = window.location.href.replace(/^https?:\/\//, "");
  return `https://metamask.app.link/dapp/${dappUrl}`;
}

export function SiweLoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useMemo(() => isMobileBrowser(), []);
  const hasInjectedWallet = typeof window !== "undefined" && !!window.ethereum;

  const handleSiweSignIn = async () => {
    try {
      setIsLoading(true);

      // Check if wallet is available
      if (!window.ethereum) {
        if (isMobile) {
          // Deep-link into MetaMask's in-app browser
          window.location.href = metamaskDeepLink();
          return;
        }
        toast.error("Wallet not found", {
          description: "Please install a Web3 wallet like MetaMask.",
        });
        return;
      }

      // Request accounts
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (!accounts.length) {
        toast.error("No accounts found", {
          description: "Please unlock your wallet and try again.",
        });
        return;
      }

      const address = sanitizeAddress(String(accounts[0]));

      const currentChainId = await getWalletChainId();
      if (currentChainId !== AMOY_CHAIN_ID) {
        await ensureAmoyChain();
        const chain = getChainConfig(AMOY_CHAIN_ID);
        toast.success("Network updated", {
          description: `Connected to ${chain.name}.`,
        });
      }

      // Get nonce from backend
      const nonceResponse = await fetch("/api/auth/siwe/nonce");
      if (!nonceResponse.ok) {
        toast.error("Failed to start sign-in", {
          description: "Could not fetch a login nonce. Please try again.",
        });
        return;
      }
      const { nonce } = await nonceResponse.json();
      if (!nonce) {
        toast.error("Failed to start sign-in", {
          description: "Login nonce was missing. Please try again.",
        });
        return;
      }

      // Get chain ID
      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      // Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address: address,
        statement: "Sign in with Ethereum to eth.ed",
        uri: window.location.origin,
        version: "1",
        chainId: parseInt(chainId as string, 16),
        nonce: nonce,
      });

      const messageToSign = message.prepareMessage();

      // Sign the message
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [messageToSign, address],
      });

      // Sign in with the signature
      const result = await signIn("siwe", {
        message: messageToSign,
        signature: signature,
        redirect: true,
        callbackUrl: "/dashboard",
      });

      if (!result?.ok) {
        toast.error("Sign in failed", {
          description: "Please try again.",
        });
      }
    } catch (error) {
      const info = getBlockchainErrorInfo(error);
      toast.error(info.title, {
        description: info.description || "Failed to sign in with Ethereum.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSiweSignIn}
      disabled={isLoading}
      variant="outline"
      className="w-full"
      size="lg"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : isMobile && !hasInjectedWallet ? (
        <Smartphone className="mr-2 h-4 w-4" />
      ) : (
        <Wallet className="mr-2 h-4 w-4" />
      )}
      {isLoading
        ? "Connecting..."
        : isMobile && !hasInjectedWallet
          ? "Open in MetaMask"
          : "Sign in with Ethereum"}
    </Button>
  );
}
