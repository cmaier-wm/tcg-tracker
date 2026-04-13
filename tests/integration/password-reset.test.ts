import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createPasswordResetRequest,
  getPasswordResetTokenStatus,
  resetPasswordFromToken
} from "@/lib/auth/password-reset";
import {
  createAuthSession,
  createUserAccountWithCredential,
  getUserCredentialByEmail
} from "@/lib/auth/auth-session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getDemoStore, resetDemoStore } from "@/lib/db/demo-store";

describe("password reset integration", () => {
  beforeEach(() => {
    resetDemoStore();
    vi.restoreAllMocks();
  });

  it("issues a reset token only for an existing email/password account", async () => {
    const passwordHash = await hashPassword("password123");
    await createUserAccountWithCredential({
      email: "collector@example.com",
      passwordHash
    });

    const existing = await createPasswordResetRequest("collector@example.com");
    const missing = await createPasswordResetRequest("missing@example.com");

    expect(existing.resetToken).toBeTruthy();
    expect(missing.resetToken).toBeNull();
    expect(getDemoStore().passwordResetTokens).toHaveLength(1);
  });

  it("revokes older reset tokens when a newer request is issued", async () => {
    const passwordHash = await hashPassword("password123");
    await createUserAccountWithCredential({
      email: "collector@example.com",
      passwordHash
    });

    const first = await createPasswordResetRequest("collector@example.com");
    const second = await createPasswordResetRequest("collector@example.com");

    const tokens = getDemoStore().passwordResetTokens;

    expect(first.resetToken).not.toBeNull();
    expect(second.resetToken).not.toBeNull();
    expect(tokens).toHaveLength(2);
    expect(tokens.filter((token) => token.revokedAt === null)).toHaveLength(1);
  });

  it("resets the password and revokes active sessions", async () => {
    const passwordHash = await hashPassword("password123");
    const user = await createUserAccountWithCredential({
      email: "collector@example.com",
      passwordHash
    });

    expect(user).not.toBeNull();

    await createAuthSession(user!.userId);
    const request = await createPasswordResetRequest("collector@example.com");

    expect(request.resetToken).toBeTruthy();

    const result = await resetPasswordFromToken({
      token: request.resetToken!,
      password: "new-password123"
    });

    const credential = await getUserCredentialByEmail("collector@example.com");
    const sessions = getDemoStore().sessions.filter((session) => session.userId === user!.userId);
    const status = await getPasswordResetTokenStatus(request.resetToken!);

    expect(result.message).toContain("updated");
    expect(await verifyPassword("new-password123", credential!.passwordHash)).toBe(true);
    expect(await verifyPassword("password123", credential!.passwordHash)).toBe(false);
    expect(sessions).toHaveLength(0);
    expect(status.state).toBe("invalid");
  });

  it("rejects current-password reuse and expired or reused tokens", async () => {
    const passwordHash = await hashPassword("password123");
    await createUserAccountWithCredential({
      email: "collector@example.com",
      passwordHash
    });

    const request = await createPasswordResetRequest("collector@example.com");
    const tokenRecord = getDemoStore().passwordResetTokens[0];
    tokenRecord.expiresAt = new Date(Date.now() - 1000).toISOString();

    await expect(
      resetPasswordFromToken({
        token: request.resetToken!,
        password: "new-password123"
      })
    ).rejects.toThrow("invalid or has expired");

    const secondRequest = await createPasswordResetRequest("collector@example.com");

    await expect(
      resetPasswordFromToken({
        token: secondRequest.resetToken!,
        password: "password123"
      })
    ).rejects.toThrow("different from your current password");

    await resetPasswordFromToken({
      token: secondRequest.resetToken!,
      password: "new-password123"
    });

    await expect(
      resetPasswordFromToken({
        token: secondRequest.resetToken!,
        password: "another-password123"
      })
    ).rejects.toThrow("invalid or has expired");
  });
});
