export type BlockchainErrorInfo = {
  title: string;
  description?: string;
  code?: number | string;
  isChainError?: boolean;
};

export function getBlockchainErrorInfo(error: unknown): BlockchainErrorInfo {
  if (!error) {
    return {
      title: "Blockchain error",
      description: "Something went wrong with your wallet connection.",
    };
  }

  const message =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : "Unknown blockchain error";

  const code =
    typeof error === "object" && error !== null && "code" in error
      ? (error as { code?: number | string }).code
      : undefined;

  if (code === 4001) {
    return {
      title: "Transaction rejected",
      description: "You rejected the request in your wallet.",
      code,
    };
  }

  if (code === 4902) {
    return {
      title: "Unsupported chain",
      description: "Your wallet does not recognize this chain yet.",
      code,
      isChainError: true,
    };
  }

  if (code === -32002) {
    return {
      title: "Wallet request pending",
      description: "Check your wallet to complete the pending request.",
      code,
    };
  }

  if (typeof message === "string") {
    const lower = message.toLowerCase();

    // Normalize and present common address/formatting errors to users more clearly
    if (lower.includes("eip-55") || lower.includes("checksum") || lower.includes("invalid address")) {
      // If it's a code-level error (not user manual entry), give a slightly more technical hint
      const isManualEntry = lower.includes("format") || lower.includes("invalid address");
      return {
        title: "Invalid address",
        description: isManualEntry
          ? "The address looks invalid — remove extra spaces or invisible characters, or ensure it starts with `0x`. If you're using a wallet, try clicking **Connect Current Wallet** again."
          : "The wallet returned an invalid address format. Please try reconnecting your wallet.",
      };
    }

    if (lower.includes("chain") && (lower.includes("switch") || lower.includes("wrong"))) {
      return {
        title: "Wrong network",
        description: "Please switch to the supported network and try again.",
        isChainError: true,
      };
    }

    if (lower.includes("user rejected") || lower.includes("denied")) {
      return {
        title: "Request rejected",
        description: "You denied the wallet request.",
      };
    }

    if (lower.includes("insufficient funds")) {
      return {
        title: "Insufficient funds",
        description: "Your wallet does not have enough balance for gas.",
      };
    }
  }

  return {
    title: "Blockchain error",
    description: message,
    code,
  };
}
