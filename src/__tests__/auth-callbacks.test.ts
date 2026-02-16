import { describe, it, expect } from "vitest";
import { authOptions } from "@/lib/auth";

describe("NextAuth callbacks", () => {
  it("should propagate wallet address from user -> token -> session", async () => {
    const dummyUser = { id: "u1", email: "u1@example.com", name: "User One", address: "0xabc123def456abc123def456abc123def456abcd" } as any;

    // Call jwt callback with a newly-signed-in user
    const jwtCallback = authOptions.callbacks?.jwt as any;
    const token = await jwtCallback({ token: {}, user: dummyUser });

    expect(token.id).toBe(dummyUser.id);
    expect(token.address).toBe(dummyUser.address);

    // Call session callback to ensure session.address gets populated
    const sessionCallback = authOptions.callbacks?.session as any;
    const session = await sessionCallback({ session: { user: {} } as any, token });

    expect(session.user.id).toBe(dummyUser.id);
    expect(session.address).toBe(dummyUser.address);
  });
});
