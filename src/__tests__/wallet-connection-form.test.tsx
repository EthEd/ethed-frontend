import "@testing-library/jest-dom/vitest";

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import WalletConnectionForm from "@/components/forms/WalletConnectionForm";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}

describe("WalletConnectionForm - Connect Current Wallet", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    (window as any).ethereum = undefined;
    globalThis.fetch = vi.fn() as any;
  });

  afterEach(() => {
    cleanup();
    globalThis.fetch = originalFetch;
  });

  it("accepts provider account with invisible characters and normalizes it", async () => {
    // provider returns an address padded with spaces and zero-width chars
    const raw = "\u200B  0x2A505a987cB41A2e2c235D851e3d74Fa24206229\u200C \n";

    (window as any).ethereum = {
      request: vi.fn(async ({ method }) => {
        if (method === "eth_requestAccounts") return [raw];
        throw new Error(`unexpected method: ${method}`);
      }),
    };

    (globalThis.fetch as any).mockResolvedValueOnce({ ok: true, json: async () => ({ wallet: { id: 'w1' } }) });

    render(<WalletConnectionForm />);

    fireEvent.click(screen.getByRole("button", { name: /connect current wallet/i }));

    await waitFor(() => {
      expect((globalThis.fetch as any)).toHaveBeenCalled();
      const call = (globalThis.fetch as any).mock.calls.find((c: any) => c[0] === "/api/user/wallets");
      expect(call).toBeTruthy();
      const body = JSON.parse(call[1].body);
      expect(body.address).toBe("0x2a505a987cb41a2e2c235d851e3d74fa24206229");
    });
  });
});
