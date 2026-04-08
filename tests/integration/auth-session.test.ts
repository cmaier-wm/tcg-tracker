import { beforeEach, describe, expect, it } from "vitest";
import {
  createAuthSession,
  createUserAccountWithCredential,
  findUserAccountByEmail,
  getUserCredentialByEmail,
  resolvePostAuthRedirect,
  setTestAuthenticatedUser
} from "@/lib/auth/auth-session";
import { resetDemoStore, getDemoStore } from "@/lib/db/demo-store";
import { hashPassword } from "@/lib/auth/password";
import {
  loginRequestSchema,
  normalizeEmail,
  registerRequestSchema
} from "@/lib/auth/schemas";

describe("auth session integration", () => {
  beforeEach(() => {
    resetDemoStore();
    setTestAuthenticatedUser(undefined);
  });

  it("creates a user account with normalized email lookup", async () => {
    const passwordHash = await hashPassword("password123");
    const user = await createUserAccountWithCredential({
      email: " Collector@Example.com ",
      passwordHash
    });

    const found = await findUserAccountByEmail("collector@example.com");
    const credential = await getUserCredentialByEmail("collector@example.com");

    expect(user).toMatchObject({
      email: "collector@example.com",
      displayName: "Collector"
    });
    expect(found).toEqual(user);
    expect(credential?.user).toEqual(user);
  });

  it("prevents duplicate normalized emails from creating a second account", async () => {
    const passwordHash = await hashPassword("password123");

    await createUserAccountWithCredential({
      email: "collector@example.com",
      passwordHash
    });
    const duplicate = await createUserAccountWithCredential({
      email: " COLLECTOR@example.com ",
      passwordHash
    });

    expect(duplicate).toBeNull();
  });

  it("supports concurrent sessions for the same account", async () => {
    const passwordHash = await hashPassword("password123");
    const user = await createUserAccountWithCredential({
      email: "sessions@example.com",
      passwordHash
    });

    expect(user).not.toBeNull();

    const first = await createAuthSession(user!.userId);
    const second = await createAuthSession(user!.userId);
    const sessions = getDemoStore().sessions.filter((session) => session.userId === user!.userId);

    expect(first.sessionToken).not.toBe(second.sessionToken);
    expect(sessions).toHaveLength(2);
    expect(new Date(first.expiresAt).getTime()).toBeGreaterThan(Date.now());
    expect(new Date(second.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  it("validates malformed and partial credentials through the request schemas", () => {
    expect(() =>
      registerRequestSchema.parse({
        email: "not-an-email",
        password: "short"
      })
    ).toThrow();

    expect(() =>
      loginRequestSchema.parse({
        email: "collector@example.com",
        password: ""
      })
    ).toThrow();

    expect(normalizeEmail(" Collector@Example.com ")).toBe("collector@example.com");
  });

  it("resolves post-auth destinations for public card pages and protected defaults", () => {
    expect(resolvePostAuthRedirect("/cards")).toBe("/cards");
    expect(resolvePostAuthRedirect("/cards/pokemon/card-1")).toBe("/cards/pokemon/card-1");
    expect(resolvePostAuthRedirect("/portfolio")).toBe("/portfolio");
    expect(resolvePostAuthRedirect("https://example.com")).toBe("/portfolio");
  });
});
