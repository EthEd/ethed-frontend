import 'dotenv/config';
import { createPublicClient, createWalletClient, http } from 'viem';
import { polygonAmoy } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const AMOY_RPC_URL = process.env.AMOY_RPC_URL;
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const ENS_ADDRESS = '0xe248de43bbda470c9ca0262d09865f53270ce76d';
const NFT_ADDRESS = '0xd9a8c19a04bb1e578c2655b9f58d83d8a39cdb88';

if (!AMOY_RPC_URL || !DEPLOYER_PRIVATE_KEY) {
  throw new Error('Missing AMOY_RPC_URL or DEPLOYER_PRIVATE_KEY');
}

const publicClient = createPublicClient({ chain: polygonAmoy, transport: http(AMOY_RPC_URL) });
const walletClient = createWalletClient({ chain: polygonAmoy, transport: http(AMOY_RPC_URL), account: privateKeyToAccount(DEPLOYER_PRIVATE_KEY) });

const ENS_ABI = [
  { "inputs": [{"internalType":"string","name":"subdomain","type":"string"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"duration","type":"uint256"}],"name":"register","outputs":[],"stateMutability":"payable","type":"function" },
  { "inputs": [{"internalType":"address","name":"user","type":"address"}],"name":"getSubdomain","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function" }
];

const NFT_ABI = [
  { "inputs": [{"internalType":"address","name":"to","type":"address"},{"internalType":"string","name":"uri","type":"string"}],"name":"mint","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function" },
  { "inputs": [{"internalType":"uint256","name":"","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function" }
];

(async () => {
  try {
    const acct = privateKeyToAccount(DEPLOYER_PRIVATE_KEY);
    console.log('Using deployer:', acct.address);

    // Register subdomain
    console.log('Sending register tx...');
    const regTxHash = await walletClient.writeContract({
      address: ENS_ADDRESS,
      abi: ENS_ABI,
      functionName: 'register',
      args: ['smoketest' + Date.now().toString().slice(-4), acct.address, 3600]
    });
    console.log('register tx hash:', regTxHash);
    const regReceipt = await publicClient.waitForTransactionReceipt({ hash: regTxHash });
    console.log('register receipt status:', regReceipt.status);

    // Call getSubdomain
    const sub = await publicClient.readContract({ address: ENS_ADDRESS, abi: ENS_ABI, functionName: 'getSubdomain', args: [acct.address] });
    console.log('getSubdomain returned:', sub);

    // Mint NFT
    console.log('Sending mint tx...');
    const mintTxHash = await walletClient.writeContract({
      address: NFT_ADDRESS,
      abi: NFT_ABI,
      functionName: 'mint',
      args: [acct.address, 'ipfs://test-uri-smoke']
    });
    console.log('mint tx hash:', mintTxHash);
    const mintReceipt = await publicClient.waitForTransactionReceipt({ hash: mintTxHash });
    console.log('mint receipt status:', mintReceipt.status);

    // Check ownerOf(1) (first token)
    const owner = await publicClient.readContract({ address: NFT_ADDRESS, abi: NFT_ABI, functionName: 'ownerOf', args: [1n] });
    console.log('ownerOf(1):', owner);

    process.exit(0);
  } catch (err) {
    console.error('Smoke test error:', err);
    process.exit(1);
  }
})();