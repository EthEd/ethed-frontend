/**
 * Smart Contract ABIs and addresses
 * Update these with your deployed contract addresses
 */

export const AMOY_CHAIN_ID = 80002;

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
];

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
];

// Contract Addresses (update with your deployed addresses)
export const CONTRACTS = {
  // Polygon Amoy Testnet
  [AMOY_CHAIN_ID]: {
    NFT_CONTRACT: "0x0000000000000000000000000000000000000000", // Replace with your Amoy NFT contract
    ENS_REGISTRAR: "0x0000000000000000000000000000000000000000", // Replace with your Amoy ENS registrar
  },
  // Polygon Mainnet
  137: {
    NFT_CONTRACT: "0x0000000000000000000000000000000000000000", // Replace with your NFT contract
    ENS_REGISTRAR: "0x0000000000000000000000000000000000000000", // Replace with your ENS registrar
  },
  // Ethereum Mainnet
  1: {
    NFT_CONTRACT: "0x0000000000000000000000000000000000000000", // Replace with your NFT contract
    ENS_REGISTRAR: "0x0000000000000000000000000000000000000000", // Replace with your ENS registrar
  },
};

export const CHAIN_CONFIG = {
  [AMOY_CHAIN_ID]: {
    name: "Polygon Amoy",
    chainId: AMOY_CHAIN_ID,
    hexChainId: "0x13882",
    rpcUrls: [
      "https://rpc-amoy.polygon.technology",
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
