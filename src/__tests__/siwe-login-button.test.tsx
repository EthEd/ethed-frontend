import "@testing-library/jest-dom/vitest";

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";

const mocks = vi.hoisted(() => {
  return {
    signInMock: vi.fn(),
    toast: {
      error: vi.fn(),
      success: vi.fn(),
      info: vi.fn(),
    },
    ensureAmoyChainMock: vi.fn(),
    getWalletChainIdMock: vi.fn(),
  };
});

vi.mock("next-auth/react", () => ({
  signIn: (...args: any[]) => mocks.signInMock(...args),
}));

vi.mock("sonner", () => ({ toast: mocks.toast }));

vi.mock("@/lib/blockchain-errors", () => ({
  getBlockchainErrorInfo: () => ({ title: "Tx error", description: "Nope" }),
}));

vi.mock("@/lib/wallet-client", () => ({
  ensureAmoyChain: () => mocks.ensureAmoyChainMock(),
  getWalletChainId: () => mocks.getWalletChainIdMock(),
}));

vi.mock("@/lib/contracts", () => ({
  AMOY_CHAIN_ID: 80002,
  getChainConfig: () => ({ name: "Polygon Amoy" }),
}));

vi.mock("siwe", () => ({
  SiweMessage: class {
    prepareMessage() {
      return "prepared-siwe-message";
    }

    constructor(_args: any) {}
  },
}));

import { SiweLoginButton } from "@/components/siwe-login-button";

type EthereumLike = {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
};

function setEthereum(eth: EthereumLike | undefined) {
  (window as any).ethereum = eth;
}

describe("SiweLoginButton", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    setEthereum(undefined);
    globalThis.fetch = vi.fn() as any;
  });

  afterEach(() => {
    cleanup();
    globalThis.fetch = originalFetch;
  });

  it("toasts error when no wallet is installed", async () => {
    render(<SiweLoginButton />);
    fireEvent.click(screen.getByRole("button", { name: /sign in with ethereum/i }));

    await waitFor(() => {
      expect(mocks.toast.error).toHaveBeenCalledWith("Wallet not found", expect.any(Object));
    });
    expect(mocks.signInMock).not.toHaveBeenCalled();
  });

  it("toasts error when no accounts returned", async () => {
    setEthereum({
      request: vi.fn(async ({ method }) => {
        if (method === "eth_requestAccounts") return [];
        throw new Error(`unexpected method: ${method}`);
      }),
    });

    render(<SiweLoginButton />);
    fireEvent.click(screen.getByRole("button", { name: /sign in with ethereum/i }));

    await waitFor(() => {
      expect(mocks.toast.error).toHaveBeenCalledWith("No accounts found", expect.any(Object));
    });
    expect(mocks.signInMock).not.toHaveBeenCalled();
  });

  it("toasts error when nonce endpoint fails", async () => {
    mocks.getWalletChainIdMock.mockResolvedValueOnce(80002);

    setEthereum({
      request: vi.fn(async ({ method }) => {
        if (method === "eth_requestAccounts") return ["0xabc"];
        if (method === "eth_chainId") return "0x13882"; // 80002
        if (method === "personal_sign") return "0xsig";
        throw new Error(`unexpected method: ${method}`);
      }),
    });

    (globalThis.fetch as any).mockResolvedValueOnce({ ok: false });

    render(<SiweLoginButton />);
    fireEvent.click(screen.getByRole("button", { name: /sign in with ethereum/i }));

    await waitFor(() => {
      expect(mocks.toast.error).toHaveBeenCalledWith(
        "Failed to start sign-in",
        expect.any(Object)
      );
    });

    expect(mocks.signInMock).not.toHaveBeenCalled();
  });

  it("toasts error when nonce is missing", async () => {
    mocks.getWalletChainIdMock.mockResolvedValueOnce(80002);

    setEthereum({
      request: vi.fn(async ({ method }) => {
        if (method === "eth_requestAccounts") return ["0xabc"];
        if (method === "eth_chainId") return "0x13882";
        if (method === "personal_sign") return "0xsig";
        throw new Error(`unexpected method: ${method}`);
      }),
    });

    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(<SiweLoginButton />);
    fireEvent.click(screen.getByRole("button", { name: /sign in with ethereum/i }));

    await waitFor(() => {
      expect(mocks.toast.error).toHaveBeenCalledWith(
        "Failed to start sign-in",
        expect.any(Object)
      );
    });

    expect(mocks.signInMock).not.toHaveBeenCalled();
  });

  it("toasts error when signIn returns not ok", async () => {
    mocks.getWalletChainIdMock.mockResolvedValueOnce(80002);

    setEthereum({
      request: vi.fn(async ({ method }) => {
        if (method === "eth_requestAccounts") return ["0xabc"];
        if (method === "eth_chainId") return "0x13882";
        if (method === "personal_sign") return "0xsig";
        throw new Error(`unexpected method: ${method}`);
      }),
    });

    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ nonce: "n" }),
    });

    mocks.signInMock.mockResolvedValueOnce({ ok: false });

    render(<SiweLoginButton />);
    fireEvent.click(screen.getByRole("button", { name: /sign in with ethereum/i }));

    await waitFor(() => {
      expect(mocks.signInMock).toHaveBeenCalled();
      expect(mocks.toast.error).toHaveBeenCalledWith("Sign in failed", expect.any(Object));
    });
  });

  it("switches network when wallet on wrong chain", async () => {
    mocks.getWalletChainIdMock.mockResolvedValueOnce(1);

    setEthereum({
      request: vi.fn(async ({ method }) => {
        if (method === "eth_requestAccounts") return ["0xabc"];
        if (method === "eth_chainId") return "0x13882";
        if (method === "personal_sign") return "0xsig";
        throw new Error(`unexpected method: ${method}`);
      }),
    });

    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ nonce: "n" }),
    });

    mocks.signInMock.mockResolvedValueOnce({ ok: true });

    render(<SiweLoginButton />);
    fireEvent.click(screen.getByRole("button", { name: /sign in with ethereum/i }));

    await waitFor(() => {
      expect(mocks.ensureAmoyChainMock).toHaveBeenCalled();
      expect(mocks.toast.success).toHaveBeenCalledWith("Network updated", expect.any(Object));
    });
  });
});
