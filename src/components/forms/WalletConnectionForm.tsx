"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wallet, ExternalLink, CheckCircle, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { useENSLookup } from "@/hooks/use-ens-lookup";
import { getBlockchainErrorInfo } from "@/lib/blockchain-errors";
import { logger } from "@/lib/monitoring";

// Ethereum provider type declaration
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}

/**
 * Strip zero-width characters, smart quotes, non-ASCII whitespace, and
 * leading/trailing spaces that mobile keyboards and copy-paste love to inject.
 */
function sanitizeAddress(raw: string): string {
  return raw
    // Remove zero-width chars (U+200B, U+200C, U+200D, U+FEFF, U+00AD, etc.)
    .replace(/[\u200B-\u200D\uFEFF\u00AD\u2060\u180E]/g, "")
    // Remove smart/curly quotes
    .replace(/[\u2018\u2019\u201C\u201D]/g, "")
    // Collapse any non-standard whitespace into nothing
    .replace(/[\s\u00A0]+/g, " ")
    .trim();
}

/** Detect mobile browser (iPhone / Android) */
function isMobileBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

/** Build a deep-link URL that opens the current page inside MetaMask's in-app browser */
function metamaskDeepLink(): string {
  if (typeof window === "undefined") return "https://metamask.io/download/";
  const dappUrl = window.location.href.replace(/^https?:\/\//, "");
  return `https://metamask.app.link/dapp/${dappUrl}`;
}

interface WalletConnectionFormProps {
  onSuccess?: (wallet: any) => void;
  onError?: (error: string) => void;
  className?: string;
  showConnectedWallets?: boolean;
}

export default function WalletConnectionForm({ 
  onSuccess, 
  onError, 
  className,
  showConnectedWallets = true 
}: WalletConnectionFormProps) {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [connectedWallets, setConnectedWallets] = useState<any[]>([]);
  const { lookupByAddress, lookupByName, loading: ensLoading } = useENSLookup();

  const isMobile = useMemo(() => isMobileBrowser(), []);
  const hasInjectedWallet = typeof window !== "undefined" && !!window.ethereum;

  const connectCurrentWallet = async () => {
    // --- Mobile without injected provider ---
    if (!window.ethereum) {
      if (isMobile) {
        // Open in wallet's in-app browser via deep-link
        window.location.href = metamaskDeepLink();
        return;
      }
      toast.error("No wallet found. Please install MetaMask or another Web3 wallet.");
      return;
    }

    try {
      setLoading(true);
      
      const accounts = await window.ethereum.request({ 
        method: "eth_requestAccounts" 
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const rawAddr = sanitizeAddress(String(accounts[0]));

      // Dev-only diagnostic to help capture provider anomalies (invisible chars, formatting)
      if (process.env.NODE_ENV !== "production") {
        logger.debug("wallet-connect provider account raw", "WalletConnectionForm", {
          raw: JSON.stringify(accounts[0]),
        });
        logger.debug("wallet-connect sanitized account", "WalletConnectionForm", {
          sanitized: JSON.stringify(rawAddr),
        });
      }

      // Primary validation: expect a standard 0x-prefixed 40-hex char address
      let normalized = rawAddr;

      // If sanitized string doesn't match, attempt an aggressive normalization that strips
      // any non-hex characters (handles stray unicode or spacing the provider may include).
      if (!/^0x[a-fA-F0-9]{40}$/.test(normalized)) {
        const has0x = normalized.toLowerCase().startsWith("0x");
        const hexOnly = normalized.replace(/[^a-fA-F0-9]/g, "");
        normalized = `${has0x ? "0x" : "0x"}${hexOnly}`;
      }

      if (!/^0x[a-fA-F0-9]{40}$/.test(normalized)) {
        throw new Error("Invalid address format");
      }

      const walletAddress = normalized.toLowerCase();
      await handleWalletConnection(walletAddress);

    } catch (error: any) {
      const info = getBlockchainErrorInfo(error);
      toast.error(info.title, { description: info.description });
      onError?.(info.description || info.title);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.trim()) {
      toast.error("Please enter a wallet address");
      return;
    }

    try {
      const candidate = sanitizeAddress(address);

      // Accept ENS names (e.g. vitalik.eth) by resolving them first
      let resolvedAddress: string | null = null;

      if (candidate.includes('.') || candidate.endsWith('.eth')) {
        const ens = await lookupByName(candidate);
        if (!ens?.address) throw new Error('Could not resolve that ENS name. Please double-check the spelling.');
        resolvedAddress = ens.address;
      } else {
        // Accept hex addresses with or without 0x prefix
        const with0x = candidate.startsWith('0x') ? candidate : `0x${candidate}`;
        if (!/^0x[a-fA-F0-9]{40}$/.test(with0x)) {
          throw new Error('Invalid address');
        }
        resolvedAddress = with0x.toLowerCase();
      }

      await handleWalletConnection(resolvedAddress);
      setAddress("");
    } catch (error: any) {
      const info = getBlockchainErrorInfo(error);
      toast.error(info.title, { description: info.description });
      onError?.(info.description || info.title);
    }
  };

  const handleWalletConnection = async (walletAddress: string) => {
    try {
      setLoading(true);

      // Lookup ENS data
      const ensData = await lookupByAddress(walletAddress);

      // Connect wallet via API
      const response = await fetch("/api/user/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: walletAddress,
          chainId: 1,
          ensName: ensData?.ensName,
          ensAvatar: ensData?.ensAvatar,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to connect wallet");
      }

      toast.success("Wallet connected successfully!");
      setConnectedWallets(prev => [...prev, data.wallet]);
      onSuccess?.(data.wallet);

    } catch (error: any) {
      const errorMessage = error.message || "Failed to connect wallet";
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-purple-600" />
            Connect Wallet
          </CardTitle>
          <CardDescription>
            Connect your Ethereum wallet to access all features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connect Current Wallet */}
          <div className="space-y-3">
            <Button
              onClick={connectCurrentWallet}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : isMobile && !hasInjectedWallet ? (
                <>
                  <Smartphone className="h-4 w-4 mr-2" />
                  Open in MetaMask
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Current Wallet
                </>
              )}
            </Button>
            {isMobile && !hasInjectedWallet && (
              <p className="text-xs text-center text-muted-foreground">
                This will open the page inside MetaMask&apos;s browser so it can detect your wallet.
                You can also paste your address below.
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">
                Or add wallet address
              </span>
            </div>
          </div>

          {/* Manual Address Entry */}
          <form onSubmit={handleAddressSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="walletAddress" className="text-sm font-medium">
                Wallet Address or ENS Name
              </Label>
              <Input
                id="walletAddress"
                type="text"
                placeholder="0x... or vitalik.eth"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full font-mono text-sm"
                disabled={loading}
              />
            </div>
            
            <Button
              type="submit"
              variant="outline"
              className="w-full"
              disabled={loading || !address.trim()}
            >
              {loading || ensLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding Wallet...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Add Wallet
                </>
              )}
            </Button>
          </form>

          {/* Connected Wallets Display */}
          {showConnectedWallets && connectedWallets.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Connected Wallets
              </h4>
              <div className="space-y-2">
                {connectedWallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className="flex items-center justify-between p-3 bg-green-50/50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">
                          {wallet.ensName || `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`}
                        </p>
                        {wallet.ensName && (
                          <p className="text-xs text-muted-foreground font-mono">
                            {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                          </p>
                        )}
                      </div>
                    </div>
                    {wallet.isPrimary && (
                      <Badge variant="secondary" className="text-xs">
                        Primary
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}