/**
 * Centralized Viem Blockchain Client
 *
 * Provides a singleton `publicClient` (read-only) and a `walletClient`
 * (deployer/relayer signer) for all server-side on-chain interactions.
 *
 * Environment variables required:
 *   AMOY_RPC_URL          – JSON-RPC URL for Polygon Amoy testnet
 *   DEPLOYER_PRIVATE_KEY  – hex private key of the server relayer wallet
 */

import {
  createPublicClient,
  createWalletClient,
  http,
  type PublicClient,
  type WalletClient,
  type Account,
  decodeEventLog,
  type Log,
} from "viem";
import { polygonAmoy } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

// ---------------------------------------------------------------------------
// Environment helpers
// ---------------------------------------------------------------------------

function getRpcUrl(): string {
  const url = process.env.AMOY_RPC_URL;
  if (!url) {
    throw new Error(
      "[viem-client] AMOY_RPC_URL is not set. On-chain operations will fail."
    );
  }
  return url;
}

function getDeployerAccount(): Account {
  const key = process.env.DEPLOYER_PRIVATE_KEY;
  if (!key) {
    throw new Error(
      "[viem-client] DEPLOYER_PRIVATE_KEY is not set. Server-side signing will fail."
    );
  }
  // Ensure the key has the 0x prefix
  const prefixed = key.startsWith("0x") ? key : `0x${key}`;
  return privateKeyToAccount(prefixed as `0x${string}`);
}

// ---------------------------------------------------------------------------
// Lazy singletons – created on first access so missing env vars don't crash
// the module at import time (important for build step / test environments).
// ---------------------------------------------------------------------------

let _publicClient: PublicClient | null = null;
let _walletClient: WalletClient | null = null;

/**
 * Read-only public client for Polygon Amoy.
 */
export function getPublicClient(): PublicClient {
  if (!_publicClient) {
    _publicClient = createPublicClient({
      chain: polygonAmoy,
      transport: http(getRpcUrl()),
    });
  }
  return _publicClient;
}

/**
 * Wallet (signing) client backed by the deployer/relayer private key.
 */
export function getWalletClient(): WalletClient {
  if (!_walletClient) {
    _walletClient = createWalletClient({
      account: getDeployerAccount(),
      chain: polygonAmoy,
      transport: http(getRpcUrl()),
    });
  }
  return _walletClient;
}

/**
 * Get the deployer/relayer address.
 */
export function getDeployerAddress(): `0x${string}` {
  return getDeployerAccount().address;
}

/**
 * Check whether on-chain operations are available (env vars present).
 */
export function isOnChainEnabled(): boolean {
  return !!(process.env.AMOY_RPC_URL && process.env.DEPLOYER_PRIVATE_KEY);
}

// ---------------------------------------------------------------------------
// Utility: decode event log
// ---------------------------------------------------------------------------

export { decodeEventLog };
export type { Log };
