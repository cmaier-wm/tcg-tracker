import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST as requestReset } from "@/app/api/auth/password-reset/request/route";
import { POST as confirmReset } from "@/app/api/auth/password-reset/confirm/route";

const passwordResetMocks = vi.hoisted(() => ({
  buildPasswordResetUrl: vi.fn(),
  createPasswordResetRequest: vi.fn(),
  getPasswordResetRequestAcceptedMessage: vi.fn(),
  PasswordResetTokenError: class PasswordResetTokenError extends Error {
    status: number;
    constructor(message: string, status = 410) {
      super(message);
      this.status = status;
    }
  },
  resetPasswordFromToken: vi.fn()
}));

const deliveryMocks = vi.hoisted(() => ({
  deliverPasswordReset: vi.fn()
}));

const auditLogMocks = vi.hoisted(() => ({
  recordAuthAuditEvent: vi.fn()
}));

vi.mock("@/lib/auth/password-reset", () => passwordResetMocks);
vi.mock("@/lib/auth/reset-delivery", () => deliveryMocks);
vi.mock("@/lib/auth/audit-log", () => auditLogMocks);

describe("password reset contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    passwordResetMocks.getPasswordResetRequestAcceptedMessage.mockReturnValue(
      "If an account exists for that email, a password reset link has been sent."
    );
    passwordResetMocks.buildPasswordResetUrl.mockReturnValue(
      "http://localhost:3000/reset-password/reset-token"
    );
    auditLogMocks.recordAuthAuditEvent.mockResolvedValue(undefined);
  });

  it("accepts password reset requests with the same generic response", async () => {
    passwordResetMocks.createPasswordResetRequest.mockResolvedValueOnce({
      accepted: true,
      email: "collector@example.com",
      resetToken: "reset-token"
    });

    const existingResponse = await requestReset(
      new Request("http://localhost/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "collector@example.com" })
      })
    );

    passwordResetMocks.createPasswordResetRequest.mockResolvedValueOnce({
      accepted: true,
      email: "nobody@example.com",
      resetToken: null
    });

    const missingResponse = await requestReset(
      new Request("http://localhost/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "nobody@example.com" })
      })
    );

    const existingPayload = await existingResponse.json();
    const missingPayload = await missingResponse.json();

    expect(existingResponse.status).toBe(202);
    expect(missingResponse.status).toBe(202);
    expect(existingPayload).toEqual(missingPayload);
    expect(deliveryMocks.deliverPasswordReset).toHaveBeenCalledTimes(1);
  });

  it("completes a valid password reset", async () => {
    passwordResetMocks.resetPasswordFromToken.mockResolvedValueOnce({
      message: "Your password has been updated. Sign in with your new password."
    });

    const response = await confirmReset(
      new Request("http://localhost/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "reset-token",
          password: "password123"
        })
      })
    );

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.message).toContain("updated");
  });

  it("rejects invalid or expired reset tokens", async () => {
    passwordResetMocks.resetPasswordFromToken.mockRejectedValueOnce(
      new passwordResetMocks.PasswordResetTokenError(
        "This password reset link is invalid or has expired. Request a new reset link."
      )
    );

    const response = await confirmReset(
      new Request("http://localhost/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "expired-token",
          password: "password123"
        })
      })
    );

    const payload = await response.json();

    expect(response.status).toBe(410);
    expect(payload.error).toContain("invalid or has expired");
  });
});
