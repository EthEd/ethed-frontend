import React from "react";
import { render, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("next-auth/react", () => ({
  useSession: () => ({ status: "authenticated" }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock("@/lib/wallet-client", () => ({
  getWalletChainId: vi.fn(),
  ensureAmoyChain: vi.fn(),
}));

import { AMOY_CHAIN_ID } from "@/lib/contracts";
import { ChainSwitcher } from "@/components/providers/SessionProvider";
import { ensureAmoyChain, getWalletChainId } from "@/lib/wallet-client";
import { toast } from "sonner";

function flushAllTimers() {
  return act(async () => {
    await vi.runAllTimersAsync();
  });
}

describe("ChainSwitcher", () => {
  beforeEach(() => {
    vi.useFakeTimers();

    // Minimal ethereum stub for effect guard + event listeners.
    (globalThis as any).window = globalThis.window ?? ({} as any);
    (globalThis as any).window.ethereum = {
      on: vi.fn(),
      removeListener: vi.fn(),
      request: vi.fn(),
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("retries chain switching with backoff and succeeds", async () => {
    (getWalletChainId as any).mockResolvedValue(1);

    (ensureAmoyChain as any)
      .mockRejectedValueOnce(new Error("temporary"))
      .mockRejectedValueOnce(new Error("temporary"))
      .mockResolvedValueOnce(AMOY_CHAIN_ID);

    render(
      <ChainSwitcher>
        <div>child</div>
      </ChainSwitcher>
    );

    await flushAllTimers();

    expect(ensureAmoyChain).toHaveBeenCalledTimes(3);
    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("does nothing if already on Amoy", async () => {
    (getWalletChainId as any).mockResolvedValue(AMOY_CHAIN_ID);

    render(
      <ChainSwitcher>
        <div>child</div>
      </ChainSwitcher>
    );

    await flushAllTimers();

    expect(ensureAmoyChain).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });
});
