import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => {
  return {
    verifyMock: vi.fn(),
    prismaMock: {
      user: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
      walletAddress: {
        findFirst: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
      },
    },
  };
});

vi.mock("next-auth/providers/credentials", () => ({
  default: (config: any) => config,
}));

vi.mock("siwe", () => ({
  SiweMessage: class {
    address: string;
    chainId: number;
    nonce: string;

    constructor(input: any) {
      if (typeof input === "string") {
        // Minimal parsing for tests
        this.address = "0xabc";
        this.chainId = 80002;
        this.nonce = "nonce-from-message";
      } else {
        this.address = input.address;
        this.chainId = input.chainId;
        this.nonce = input.nonce;
      }
    }

    async verify({ signature }: { signature: string }) {
      return mocks.verifyMock(signature);
    }
  },
}));

vi.mock("@/lib/prisma-client", () => ({
  prisma: mocks.prismaMock,
}));

import { SiweProvider } from "@/lib/siwe-provider";

function providerAuthorize() {
  const config = SiweProvider() as any;
  return config.authorize as (credentials: any, req?: any) => Promise<any>;
}

describe("SiweProvider authorize edge cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects missing credentials", async () => {
    const authorize = providerAuthorize();
    await expect(authorize(undefined as any, { headers: { cookie: "siwe-nonce=x" } })).rejects.toThrow(
      /Missing message or signature/
    );
  });

  it("rejects when nonce cookie missing", async () => {
    const authorize = providerAuthorize();
    await expect(
      authorize({ message: JSON.stringify({ address: "0xabc", chainId: 80002, nonce: "n" }), signature: "0x1" }, { headers: {} })
    ).rejects.toThrow(/Missing SIWE nonce cookie/);
  });

  it("rejects nonce mismatch", async () => {
    const authorize = providerAuthorize();
    await expect(
      authorize(
        {
          message: JSON.stringify({ address: "0xabc", chainId: 80002, nonce: "wrong" }),
          signature: "0x1",
        },
        { headers: { cookie: "siwe-nonce=expected" } }
      )
    ).rejects.toThrow(/Invalid SIWE nonce/);
  });

  it("rejects wrong network", async () => {
    const authorize = providerAuthorize();
    await expect(
      authorize(
        {
          message: JSON.stringify({ address: "0xabc", chainId: 1, nonce: "expected" }),
          signature: "0x1",
        },
        { headers: { cookie: "siwe-nonce=expected" } }
      )
    ).rejects.toThrow(/Wrong network/);
  });

  it("creates a user when wallet not found", async () => {
    mocks.verifyMock.mockResolvedValueOnce({});
    mocks.prismaMock.user.findFirst.mockResolvedValueOnce(null);
    mocks.prismaMock.user.create.mockResolvedValueOnce({
      id: "u1",
      email: "0xabc@ethereum.local",
      name: "0xabc...xabc",
      image: null,
    });

    const authorize = providerAuthorize();

    const user = await authorize(
      {
        message: JSON.stringify({ address: "0xabc", chainId: 80002, nonce: "expected" }),
        signature: "0xsignature",
      },
      { headers: { cookie: "siwe-nonce=expected" } }
    );

    expect(mocks.verifyMock).toHaveBeenCalledWith("0xsignature");
    expect(mocks.prismaMock.user.create).toHaveBeenCalled();
    expect(user.id).toBe("u1");
  });

  it("accepts the specific wallet address 0x2A505a...6229", async () => {
    // ensure provider accepts mixed-case address and proceeds with user creation
    const testAddress = "0x2A505a987cB41A2e2c235D851e3d74Fa24206229";
    mocks.verifyMock.mockResolvedValueOnce({});
    mocks.prismaMock.user.findFirst.mockResolvedValueOnce(null);
    mocks.prismaMock.user.create.mockResolvedValueOnce({
      id: "u2",
      email: `${testAddress}@ethereum.local`,
      name: `${testAddress.slice(0, 6)}...${testAddress.slice(-4)}`,
      image: null,
    });

    const authorize = providerAuthorize();

    const user = await authorize(
      {
        message: JSON.stringify({ address: testAddress, chainId: 80002, nonce: "expected" }),
        signature: "0xsignature",
      },
      { headers: { cookie: "siwe-nonce=expected" } }
    );

    expect(mocks.verifyMock).toHaveBeenCalledWith("0xsignature");
    expect(mocks.prismaMock.user.create).toHaveBeenCalled();
    expect(user.id).toBe("u2");
  });
});
