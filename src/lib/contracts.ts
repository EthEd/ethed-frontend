/**
 * Smart Contract ABIs and addresses
 *
 * Contract addresses can be overridden via environment variables:
 *   NFT_CONTRACT_ADDRESS      – deployed ERC-721 (overrides testnet default)
 *   ENS_REGISTRAR_ADDRESS     – deployed ENS registrar mock (overrides testnet default)
 */

import { logger } from "./monitoring";

export const AMOY_CHAIN_ID = 80002;

export const ENS_ROOT_DOMAIN = "ayushetty.eth";

// ---------------------------------------------------------------------------
// ABIs
// ---------------------------------------------------------------------------

// NFT Contract ABI (ERC-721)
export const NFT_CONTRACT_ABI = [
  // Minimal ABI for minting
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "string", name: "uri", type: "string" },
    ],
    name: "mint",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "to", type: "address" },
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "Minted",
    type: "event",
  },
  // ownerOf (standard ERC-721)
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  // tokenURI (standard ERC-721 metadata)
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// ENS Registrar Contract ABI
export const ENS_REGISTRAR_ABI = [
  {
    inputs: [
      { internalType: "string", name: "subdomain", type: "string" },
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "uint256", name: "duration", type: "uint256" },
    ],
    name: "register",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "string", name: "subdomain", type: "string" },
      { indexed: true, internalType: "address", name: "owner", type: "address" },
    ],
    name: "SubdomainRegistered",
    type: "event",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getSubdomain",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// ---------------------------------------------------------------------------
// Default deployed addresses (Polygon Amoy testnet)
// ---------------------------------------------------------------------------

const DEFAULT_NFT_CONTRACT_AMOY = "0xd9a8c19a04bb1e578c2655b9f58d83d8a39cdb88";
const DEFAULT_ENS_REGISTRAR_AMOY = "0xe248de43bbda470c9ca0262d09865f53270ce76d";

// Contract Addresses – prefer env overrides, fallback to defaults
export const CONTRACTS: Record<number, Record<string, string>> = {
  // Polygon Amoy Testnet
  [AMOY_CHAIN_ID]: {
    NFT_CONTRACT: process.env.NFT_CONTRACT_ADDRESS || DEFAULT_NFT_CONTRACT_AMOY,
    ENS_REGISTRAR: process.env.ENS_REGISTRAR_ADDRESS || DEFAULT_ENS_REGISTRAR_AMOY,
  },
  // Polygon Mainnet — not yet deployed
  // 137: { ... },
  // Ethereum Mainnet — not yet deployed
  // 1: { ... },
};

export const CHAIN_CONFIG = {
  [AMOY_CHAIN_ID]: {
    name: "Polygon Amoy",
    chainId: AMOY_CHAIN_ID,
    hexChainId: "0x13882",
    rpcUrls: [
      process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology",
      "https://polygon-amoy-bor-rpc.publicnode.com",
    ],
    blockExplorerUrls: ["https://amoy.polygonscan.com"],
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
  },
  137: {
    name: "Polygon",
    chainId: 137,
    hexChainId: "0x89",
    rpcUrls: ["https://polygon-rpc.com"],
    blockExplorerUrls: ["https://polygonscan.com"],
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
  },
  1: {
    name: "Ethereum",
    chainId: 1,
    hexChainId: "0x1",
    rpcUrls: ["https://cloudflare-eth.com"],
    blockExplorerUrls: ["https://etherscan.io"],
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
} as const;

/**
 * Get contract address for specific chain
 */
export function getContractAddress(
  chainId: number,
  contractName: "NFT_CONTRACT" | "ENS_REGISTRAR"
): string {
  const contracts = CONTRACTS[chainId as keyof typeof CONTRACTS];
  if (!contracts) {
    throw new Error(`Chain ID ${chainId} not supported`);
  }
  return contracts[contractName];
}

export function getChainConfig(chainId: number) {
  const chain = CHAIN_CONFIG[chainId as keyof typeof CHAIN_CONFIG];
  if (!chain) {
    throw new Error(`Chain ID ${chainId} not supported`);
  }
  return chain;
}

export function getDefaultRpcUrl(chainId: number) {
  return getChainConfig(chainId).rpcUrls[0];
}

/**
 * Build a block-explorer URL for a transaction hash.
 */
export function getExplorerTxUrl(chainId: number, txHash: string): string {
  const chain = getChainConfig(chainId);
  return `${chain.blockExplorerUrls[0]}/tx/${txHash}`;
}

/**
 * Build a block-explorer URL for a contract / address.
 */
export function getExplorerAddressUrl(chainId: number, address: string): string {
  const chain = getChainConfig(chainId);
  return `${chain.blockExplorerUrls[0]}/address/${address}`;
}

// ---------------------------------------------------------------------------
// Production safety: warn about placeholder addresses
// ---------------------------------------------------------------------------
if (process.env.NODE_ENV === "production") {
  const amoy = CONTRACTS[AMOY_CHAIN_ID];
  if (amoy) {
    for (const [name, addr] of Object.entries(amoy)) {
      if (addr === "0x0000000000000000000000000000000000000000") {
        logger.warn(
          `${name} on Amoy uses placeholder address 0x000...000. Set NFT_CONTRACT_ADDRESS / ENS_REGISTRAR_ADDRESS env vars.`,
          "contracts"
        );
      }
    }
  }
}
