/**
 * Smart Contract ABIs and addresses
 * Update these with your deployed contract addresses
 */

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
  // Polygon Mumbai Testnet
  80001: {
    NFT_CONTRACT: "0x0000000000000000000000000000000000000000", // Replace with your NFT contract
    ENS_REGISTRAR: "0x0000000000000000000000000000000000000000", // Replace with your ENS registrar
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
