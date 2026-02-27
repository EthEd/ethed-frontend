import { AMOY_CHAIN_ID, getChainConfig } from "@/lib/contracts";

export async function getWalletChainId(): Promise<number | null> {
  if (typeof window === "undefined" || !window.ethereum) {
    return null;
  }

  const chainIdHex = (await window.ethereum.request({
    method: "eth_chainId",
  })) as string;

  return parseInt(chainIdHex, 16);
}

export async function switchToChain(targetChainId: number): Promise<void> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No wallet detected");
  }

  const chainConfig = getChainConfig(targetChainId);

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainConfig.hexChainId }],
    });
  } catch (error: unknown) {
    if ((error as { code?: number })?.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: chainConfig.hexChainId,
            chainName: chainConfig.name,
            rpcUrls: chainConfig.rpcUrls,
            blockExplorerUrls: chainConfig.blockExplorerUrls,
            nativeCurrency: chainConfig.nativeCurrency,
          },
        ],
      });
      return;
    }

    throw error;
  }
}

export async function ensureAmoyChain(): Promise<number | null> {
  const currentChainId = await getWalletChainId();

  if (currentChainId === null) {
    return null;
  }

  if (currentChainId !== AMOY_CHAIN_ID) {
    await switchToChain(AMOY_CHAIN_ID);
  }

  return AMOY_CHAIN_ID;
}
