"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { SiweMessage } from "siwe";

export function SiweLoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSiweSignIn = async () => {
    try {
      setIsLoading(true);

      // Check if wallet is available
      if (!window.ethereum) {
        alert("Please install a Web3 wallet like MetaMask");
        return;
      }

      // Request accounts
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (!accounts.length) {
        alert("No accounts found in wallet");
        return;
      }

      const address = accounts[0];

      // Get nonce from backend
      const nonceResponse = await fetch("/api/auth/siwe/nonce");
      const { nonce } = await nonceResponse.json();

      // Get chain ID
      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      // Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address: address,
        statement: "Sign in with Ethereum to ETHed",
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
        alert("Sign in failed");
      }
    } catch (error) {
      console.error("SIWE sign in error:", error);
      if (error instanceof Error) {
        alert(`Sign in error: ${error.message}`);
      } else {
        alert("Failed to sign in with Ethereum");
      }
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
      ) : (
        <Wallet className="mr-2 h-4 w-4" />
      )}
      {isLoading ? "Connecting..." : "Sign in with Ethereum"}
    </Button>
  );
}
