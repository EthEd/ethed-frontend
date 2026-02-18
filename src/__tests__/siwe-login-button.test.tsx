import "@testing-library/jest-dom/vitest";

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";

// Valid 40-hex test address for tests that need to pass address validation
const VALID_TEST_ADDRESS = "0x2A505a987cB41A2e2c235D851e3d74Fa24206229";

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
    siweConstructorMock: vi.fn(),
  };
});

vi.mock("next-auth/react", () => ({
  signIn: (...args: any[]) => mocks.signInMock(...args),
}));

vi.mock("sonner", () => ({ toast: mocks.toast }));

// Use a simplified version of getBlockchainErrorInfo that matches common error patterns
vi.mock("@/lib/blockchain-errors", () => ({
  getBlockchainErrorInfo: (error: unknown) => {
    const message = typeof error === "string" ? error : (error instanceof Error ? error.message : "");
    const lower = message.toLowerCase();
    if (lower.includes("invalid address") || lower.includes("address format")) {
      return { title: "Invalid address", description: "The address looks invalid." };
    }
    return { title: "Blockchain error", description: message || "Something went wrong." };
  },
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

    constructor(args: any) {
      mocks.siweConstructorMock(args);
    }
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
        if (method === "eth_requestAccounts") return [VALID_TEST_ADDRESS];
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
        if (method === "eth_requestAccounts") return [VALID_TEST_ADDRESS];
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

  it("continues SIWE flow even if `siwe-nonce` is not visible to document.cookie (HttpOnly)", async () => {
    // ensure wallet and chain are correct
    mocks.getWalletChainIdMock.mockResolvedValueOnce(80002);

    setEthereum({
      request: vi.fn(async ({ method }) => {
        if (method === "eth_requestAccounts") return [VALID_TEST_ADDRESS];
        if (method === "eth_chainId") return "0x13882"; // 80002
        if (method === "personal_sign") return "0xsig";
        throw new Error(`unexpected method: ${method}`);
      }),
    });

    // nonce endpoint returns a nonce, but document.cookie does NOT contain siwe-nonce
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ nonce: "n" }),
    });

    // ensure document.cookie does not include siwe-nonce
    Object.defineProperty(document, 'cookie', { value: '', configurable: true });

    mocks.signInMock.mockResolvedValueOnce({ ok: true });

    render(<SiweLoginButton />);
    fireEvent.click(screen.getByRole("button", { name: /sign in with ethereum/i }));

    await waitFor(() => {
      expect(mocks.signInMock).toHaveBeenCalled();
    });
  });

  it("sanitizes and accepts a mixed-case address (your wallet) from the provider", async () => {
    const rawAddress = "  0x2A505a987cB41A2e2c235D851e3d74Fa24206229  ";
    mocks.getWalletChainIdMock.mockResolvedValueOnce(80002);

    setEthereum({
      request: vi.fn(async ({ method }) => {
        if (method === "eth_requestAccounts") return [rawAddress];
        if (method === "eth_chainId") return "0x13882";
        if (method === "personal_sign") return "0xsig";
        throw new Error(`unexpected method: ${method}`);
      }),
    });

    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ nonce: "n" }),
    });

    // simulate cookie being HttpOnly (not visible)
    Object.defineProperty(document, 'cookie', { value: '', configurable: true });

    mocks.signInMock.mockResolvedValueOnce({ ok: true });

    render(<SiweLoginButton />);
    fireEvent.click(screen.getByRole("button", { name: /sign in with ethereum/i }));

    await waitFor(() => {
      expect(mocks.signInMock).toHaveBeenCalled();
      // ensure signIn was invoked (address is passed into message by SiweMessage in real flow)
    });
  });

  it("sanitizes zero-width characters in provider address and proceeds", async () => {
    const rawAddress = "\u200B0x2A505a987cB41A2e2c235D851e3d74Fa24206229"; // zero-width prefix
    mocks.getWalletChainIdMock.mockResolvedValueOnce(80002);

    setEthereum({
      request: vi.fn(async ({ method }) => {
        if (method === "eth_requestAccounts") return [rawAddress];
        if (method === "eth_chainId") return "0x13882";
        if (method === "personal_sign") return "0xsig";
        throw new Error(`unexpected method: ${method}`);
      }),
    });

    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ nonce: "n" }),
    });

    Object.defineProperty(document, 'cookie', { value: '', configurable: true });

    mocks.signInMock.mockResolvedValueOnce({ ok: true });

    render(<SiweLoginButton />);
    fireEvent.click(screen.getByRole("button", { name: /sign in with ethereum/i }));

    await waitFor(() => {
      expect(mocks.signInMock).toHaveBeenCalled();
    });
  });

  it("toasts 'Invalid address' when provider returns malformed address", async () => {
    // provider returns a malformed / too-short address
    setEthereum({
      request: vi.fn(async ({ method }) => {
        if (method === "eth_requestAccounts") return ["0x123"];
        throw new Error(`unexpected method: ${method}`);
      }),
    });

    render(<SiweLoginButton />);
    fireEvent.click(screen.getByRole("button", { name: /sign in with ethereum/i }));

    await waitFor(() => {
      expect(mocks.toast.error).toHaveBeenCalledWith("Invalid address", expect.any(Object));
    });
  });

  it("toasts error when signIn returns not ok", async () => {
    mocks.getWalletChainIdMock.mockResolvedValueOnce(80002);

    setEthereum({
      request: vi.fn(async ({ method }) => {
        if (method === "eth_requestAccounts") return [VALID_TEST_ADDRESS];
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

    // cookie must be present for SIWE flow to continue in test environment
    Object.defineProperty(document, 'cookie', { value: 'siwe-nonce=test; path=/', configurable: true });

    render(<SiweLoginButton />);
    fireEvent.click(screen.getByRole("button", { name: /sign in with ethereum/i }));

    await waitFor(() => {
      expect(mocks.signInMock).toHaveBeenCalled();
      expect(mocks.toast.error).toHaveBeenCalledWith("Sign in failed", expect.any(Object));
      // ensure description passed to toast is a string (prevents object-as-child React errors)
      const toastArgs = (mocks.toast.error as any).mock.calls[0][1];
      expect(typeof toastArgs.description).toBe('string');
    });
  });

  it("surfaces normalized blockchain error when signIn returns an error string", async () => {
    mocks.getWalletChainIdMock.mockResolvedValueOnce(80002);

    setEthereum({
      request: vi.fn(async ({ method }) => {
        if (method === "eth_requestAccounts") return [VALID_TEST_ADDRESS];
        if (method === "eth_chainId") return "0x13882";
        if (method === "personal_sign") return "0xsig";
        throw new Error(`unexpected method: ${method}`);
      }),
    });

    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ nonce: "n" }),
    });

    // simulate server returning an 'Invalid address' error
    mocks.signInMock.mockResolvedValueOnce({ ok: false, error: 'Invalid address' });

    Object.defineProperty(document, 'cookie', { value: 'siwe-nonce=test; path=/', configurable: true });

    render(<SiweLoginButton />);
    fireEvent.click(screen.getByRole("button", { name: /sign in with ethereum/i }));

    await waitFor(() => {
      expect(mocks.signInMock).toHaveBeenCalled();
      expect(mocks.toast.error).toHaveBeenCalledWith("Invalid address", expect.any(Object));
    });
  });

  it("switches network when wallet on wrong chain", async () => {
    mocks.getWalletChainIdMock.mockResolvedValueOnce(1);

    setEthereum({
      request: vi.fn(async ({ method }) => {
        if (method === "eth_requestAccounts") return [VALID_TEST_ADDRESS];
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

    // cookie must be present for SIWE flow to continue in test environment
    Object.defineProperty(document, 'cookie', { value: 'siwe-nonce=test; path=/', configurable: true });

    render(<SiweLoginButton />);
    fireEvent.click(screen.getByRole("button", { name: /sign in with ethereum/i }));

    await waitFor(() => {
      expect(mocks.ensureAmoyChainMock).toHaveBeenCalled();
      expect(mocks.toast.success).toHaveBeenCalledWith("Network updated", expect.any(Object));
    });
  });

  it("sanitizes and normalizes addresses with invisible characters", async () => {
    const addressWithInvisibleChars = `\u200B${VALID_TEST_ADDRESS}\uFEFF`;
    mocks.getWalletChainIdMock.mockResolvedValueOnce(80002);

    setEthereum({
      request: vi.fn(async ({ method }) => {
        if (method === "eth_requestAccounts") return [addressWithInvisibleChars];
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
      expect(mocks.signInMock).toHaveBeenCalled();
      // Verify SiweMessage was constructed with the CLEAN address
      expect(mocks.siweConstructorMock).toHaveBeenCalledWith(
        expect.objectContaining({
          address: VALID_TEST_ADDRESS,
        })
      );
    });
  });
});
