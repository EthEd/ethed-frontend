import "dotenv/config";
import fs from "fs";
import path from "path";
import solc from "solc";
import { createPublicClient, createWalletClient, http } from "viem";
import { polygonAmoy } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

const rpcUrl = process.env.AMOY_RPC_URL;
const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

if (!rpcUrl) {
  throw new Error("Missing AMOY_RPC_URL in environment");
}

if (!privateKey) {
  throw new Error("Missing DEPLOYER_PRIVATE_KEY in environment");
}

const contractsRoot = path.resolve(process.cwd(), "src", "contracts");

const sources = {
  "ENSRegistryMock.sol": {
    content: fs.readFileSync(path.join(contractsRoot, "ENSRegistryMock.sol"), "utf8"),
  },
  "MockNFT.sol": {
    content: fs.readFileSync(path.join(contractsRoot, "MockNFT.sol"), "utf8"),
  },
};

const input = {
  language: "Solidity",
  sources,
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode.object"],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors?.length) {
  const errors = output.errors.filter((error) => error.severity === "error");
  if (errors.length) {
    console.error(output.errors);
    throw new Error("Solidity compilation failed");
  }
}

const account = privateKeyToAccount(privateKey);

const publicClient = createPublicClient({
  chain: polygonAmoy,
  transport: http(rpcUrl),
});

const walletClient = createWalletClient({
  account,
  chain: polygonAmoy,
  transport: http(rpcUrl),
});

async function deployContract(contractFile, contractName) {
  const artifact = output.contracts[contractFile][contractName];
  const abi = artifact.abi;
  const bytecode = `0x${artifact.evm.bytecode.object}`;

  const hash = await walletClient.deployContract({
    abi,
    bytecode,
    args: [],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  if (!receipt.contractAddress) {
    throw new Error(`Failed to deploy ${contractName}`);
  }

  return receipt.contractAddress;
}

const ensAddress = await deployContract("ENSRegistryMock.sol", "ENSRegistryMock");
const nftAddress = await deployContract("MockNFT.sol", "MockNFT");

console.log("✅ Deployed to Polygon Amoy");
console.log("ENS Registrar:", ensAddress);
console.log("NFT Contract:", nftAddress);
