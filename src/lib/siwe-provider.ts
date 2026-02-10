/**
 * SIWE (Sign In With Ethereum) Provider
 * Enables wallet-based authentication
 */

import CredentialsProvider from "next-auth/providers/credentials";
import { SiweMessage } from "siwe";
import { prisma } from "./prisma-client";
import { AMOY_CHAIN_ID } from "./contracts";

export function SiweProvider() {
  return CredentialsProvider({
    id: "siwe",
    name: "Ethereum",
    credentials: {
      message: { label: "Message", type: "text" },
      signature: { label: "Signature", type: "text" },
    },
    async authorize(credentials) {
      try {
        if (!credentials?.message || !credentials?.signature) {
          throw new Error("Missing message or signature");
        }

        // Parse the SIWE message (just extract the address and chain ID)
        const messageData = JSON.parse(credentials.message);
        const address = messageData.address.toLowerCase();
        const chainId = messageData.chainId || AMOY_CHAIN_ID;
        
        // Verify the signature using siwe
        const siweMessage = new SiweMessage(messageData);
        const result = await siweMessage.verify({
          signature: credentials.signature,
        });

        // result is a SiweResponse, check if it has a success flag or just throw on error
        // If verify doesn't throw, it's valid


        // Get or create user by wallet address
        let user = await prisma.user.findFirst({
          where: {
            wallets: {
              some: {
                address: address
              }
            }
          }
        });

        if (!user) {
          // Create new user if doesn't exist
          user = await prisma.user.create({
            data: {
              email: `${address}@ethereum.local`,
              name: `${address.slice(0, 6)}...${address.slice(-4)}`,
              wallets: {
                create: {
                  address,
                  chainId,
                  isPrimary: true,
                }
              }
            }
          });
        } else {
          // Check if wallet already exists for user
          const existingWallet = await prisma.walletAddress.findFirst({
            where: {
              address: address,
              userId: user.id
            }
          });
          
          if (!existingWallet) {
            // Count existing wallets to determine if this should be primary
            const walletCount = await prisma.walletAddress.count({
              where: { userId: user.id }
            });

            await prisma.walletAddress.create({
              data: {
                userId: user.id,
                address,
                chainId,
                isPrimary: walletCount === 0,
              }
            });
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          address: address,
        };
      } catch (error) {
        console.error("SIWE authorization error:", error);
        throw error;
      }
    },
  });
}
