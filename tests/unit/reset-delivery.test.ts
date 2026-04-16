import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { deliverPasswordReset } from "@/lib/auth/reset-delivery";

describe("reset delivery", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalEndpoint = process.env.AUTH_RESET_EMAIL_ENDPOINT;
  const originalResendApiKey = process.env.RESEND_API_KEY;
  const originalFromEmail = process.env.AUTH_RESET_FROM_EMAIL;
  const originalFromName = process.env.AUTH_RESET_FROM_NAME;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    delete process.env.AUTH_RESET_EMAIL_ENDPOINT;
    delete process.env.RESEND_API_KEY;
    delete process.env.AUTH_RESET_FROM_EMAIL;
    delete process.env.AUTH_RESET_FROM_NAME;
    process.env.NODE_ENV = "test";
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;

    if (originalEndpoint === undefined) {
      delete process.env.AUTH_RESET_EMAIL_ENDPOINT;
    } else {
      process.env.AUTH_RESET_EMAIL_ENDPOINT = originalEndpoint;
    }

    if (originalResendApiKey === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY = originalResendApiKey;
    }

    if (originalFromEmail === undefined) {
      delete process.env.AUTH_RESET_FROM_EMAIL;
    } else {
      process.env.AUTH_RESET_FROM_EMAIL = originalFromEmail;
    }

    if (originalFromName === undefined) {
      delete process.env.AUTH_RESET_FROM_NAME;
    } else {
      process.env.AUTH_RESET_FROM_NAME = originalFromName;
    }
  });

  it("posts to the configured endpoint outside production", async () => {
    process.env.AUTH_RESET_EMAIL_ENDPOINT = "https://example.com/reset";
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await deliverPasswordReset({
      email: "collector@example.com",
      resetUrl: "http://localhost:3000/reset-password/token"
    });

    expect(fetchMock).toHaveBeenCalledWith("https://example.com/reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: "collector@example.com",
        resetUrl: "http://localhost:3000/reset-password/token"
      })
    });
  });

  it("logs the reset link locally when no endpoint is configured", async () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await deliverPasswordReset({
      email: "collector@example.com",
      resetUrl: "http://localhost:3000/reset-password/token"
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalledWith(
      "[password-reset] collector@example.com http://localhost:3000/reset-password/token"
    );
  });

  it("sends directly with Resend when configured", async () => {
    process.env.RESEND_API_KEY = "resend-test-key";
    process.env.AUTH_RESET_FROM_EMAIL = "noreply@example.com";
    process.env.AUTH_RESET_FROM_NAME = "Pokémon TCG Tracker";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true
    });
    vi.stubGlobal("fetch", fetchMock);

    await deliverPasswordReset({
      email: "collector@example.com",
      resetUrl: "https://example.com/reset-password/token"
    });

    expect(fetchMock).toHaveBeenCalledWith("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer resend-test-key",
        "Content-Type": "application/json"
      },
      body: expect.stringContaining("\"collector@example.com\"")
    });
  });

  it("fails in production when no endpoint or Resend config is provided", async () => {
    process.env.NODE_ENV = "production";

    await expect(
      deliverPasswordReset({
        email: "collector@example.com",
        resetUrl: "https://example.com/reset-password/token"
      })
    ).rejects.toThrow(
      "Password reset email delivery is not configured. Set AUTH_RESET_EMAIL_ENDPOINT or the Resend variables."
    );
  });
});
