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
import { logger } from "@/lib/monitoring";

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

      // NOTE: server sets `siwe-nonce` as an HttpOnly cookie — it will not be visible to `document.cookie`.
      // Do not block the SIWE flow based on a client-side cookie check (it was causing false negatives).
      try {
        const hasCookie = typeof document !== 'undefined' && document.cookie.includes('siwe-nonce=');
        if (!hasCookie) {
          // Non-blocking diagnostic for developers; proceed regardless because the server will
          // verify the nonce from the HttpOnly cookie set by `/api/auth/siwe/nonce`.
          // (Avoid showing a toast here to prevent confusing end users.)
          logger.warn('`siwe-nonce` not visible to document.cookie (expected for HttpOnly). Proceeding.', 'SiweLoginButton');
        }
      } catch (e) {
        // Ignore cookie-check errors in restrictive environments
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

      // Sign in with the signature (do not redirect so we can show server error messages)
      const result = await signIn("siwe", {
        message: messageToSign,
        signature: signature,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (!result?.ok) {
        // NextAuth returns an `error` (string or object) when authorize() fails — surface a safe string to the user
        const rawErr = (result as any)?.error;
        const errMsg = typeof rawErr === 'string' ? rawErr : (rawErr ? JSON.stringify(rawErr) : "Sign in failed. Please try again.");
        toast.error("Sign in failed", { description: errMsg });
        return;
      }

      // Redirect on success
      if (result.url) {
        window.location.href = result.url;
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
