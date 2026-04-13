import { beforeEach, describe, expect, it } from "vitest";
import {
  createPasswordResetRequest,
  getPasswordResetRequestAcceptedMessage,
  getPasswordResetTokenStatus
} from "@/lib/auth/password-reset";
import { createUserAccountWithCredential } from "@/lib/auth/auth-session";
import { hashPassword } from "@/lib/auth/password";
import { getDemoStore, resetDemoStore } from "@/lib/db/demo-store";

describe("password reset helpers", () => {
  beforeEach(() => {
    resetDemoStore();
  });

  it("returns the generic accepted message", () => {
    expect(getPasswordResetRequestAcceptedMessage()).toContain(
      "If an account exists for that email"
    );
  });

  it("reports malformed reset tokens as invalid", async () => {
    await expect(getPasswordResetTokenStatus("not-a-real-token")).resolves.toMatchObject({
      state: "invalid"
    });
  });

  it("reports expired reset tokens as invalid", async () => {
    const passwordHash = await hashPassword("password123");
    const user = await createUserAccountWithCredential({
      email: "collector@example.com",
      passwordHash
    });

    expect(user).not.toBeNull();

    const request = await createPasswordResetRequest("collector@example.com");
    getDemoStore().passwordResetTokens[0].expiresAt = new Date(Date.now() - 1000).toISOString();

    await expect(getPasswordResetTokenStatus(request.resetToken!)).resolves.toMatchObject({
      state: "invalid"
    });
  });
});
