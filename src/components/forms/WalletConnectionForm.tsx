"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wallet, ExternalLink, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useENSLookup } from "@/hooks/use-ens-lookup";

// Ethereum provider type declaration
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
  }
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
  const { lookupByAddress, loading: ensLoading } = useENSLookup();

  const connectCurrentWallet = async () => {
    if (!window.ethereum) {
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

      // Simple address validation
      if (!/^0x[a-fA-F0-9]{40}$/.test(accounts[0])) {
        throw new Error("Invalid address format");
      }

      const walletAddress = accounts[0].toLowerCase();
      await handleWalletConnection(walletAddress);

    } catch (error: any) {
      const errorMessage = error.code === 4001 
        ? "Wallet connection was rejected" 
        : error.message || "Failed to connect wallet";
      
      toast.error(errorMessage);
      onError?.(errorMessage);
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
      // Simple address validation: accept hex addresses in any case and normalize to lowercase
      const candidate = address.trim();
      if (!/^0x[a-fA-F0-9]{40}$/.test(candidate)) {
        throw new Error("Invalid address format");
      }
      
      const normalizedAddress = candidate.toLowerCase();
      await handleWalletConnection(normalizedAddress);
      setAddress("");
    } catch (error: any) {
      const msg = error?.message || "Invalid wallet address";
      toast.error(msg);
      onError?.(msg);
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
              ) : (
                <>
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Current Wallet
                </>
              )}
            </Button>
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