/**
 * SIWE (Sign In With Ethereum) Provider
 * Enables wallet-based authentication
 */

import CredentialsProvider from "next-auth/providers/credentials";
import { SiweMessage } from "siwe";
import { prisma } from "@/lib/prisma-client";
import { AMOY_CHAIN_ID } from "./contracts";

function getCookieValue(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  const parts = cookieHeader.split(";").map((p) => p.trim());
  for (const part of parts) {
    if (!part) continue;
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    if (key !== name) continue;
    return decodeURIComponent(part.slice(eq + 1));
  }
  return undefined;
}

function parseSiweMessage(message: string) {
  try {
    const maybeJson = JSON.parse(message);
    if (maybeJson && typeof maybeJson === "object") {
      return new SiweMessage(maybeJson as any);
    }
  } catch {
    // fallthrough to parse raw SIWE string
  }

  return new SiweMessage(message);
}

export function SiweProvider() {
  return CredentialsProvider({
    id: "siwe",
    name: "Ethereum",
    credentials: {
      message: { label: "Message", type: "text" },
      signature: { label: "Signature", type: "text" },
    },
    async authorize(credentials, req) {
      try {
        if (!credentials?.message || !credentials?.signature) {
          throw new Error("Missing message or signature");
        }

        const siweMessage = parseSiweMessage(credentials.message);
        const address = siweMessage.address?.toLowerCase();

        if (!address) {
          throw new Error("Invalid SIWE message: missing address");
        }

        const chainId = (siweMessage.chainId ?? AMOY_CHAIN_ID) as number;
        if (chainId !== AMOY_CHAIN_ID) {
          throw new Error("Wrong network: please switch to Polygon Amoy");
        }

        const cookieHeader = (req as any)?.headers?.cookie as string | undefined;
        const nonceCookie = getCookieValue(cookieHeader, "siwe-nonce");
        if (!nonceCookie) {
          throw new Error("Missing SIWE nonce cookie");
        }

        if (siweMessage.nonce !== nonceCookie) {
          throw new Error("Invalid SIWE nonce");
        }

        await siweMessage.verify({
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
        throw error;
      }
    },
  });
}
