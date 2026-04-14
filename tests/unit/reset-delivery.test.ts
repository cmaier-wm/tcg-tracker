import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { deliverPasswordReset } from "@/lib/auth/reset-delivery";

describe("reset delivery", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalEndpoint = process.env.AUTH_RESET_EMAIL_ENDPOINT;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    delete process.env.AUTH_RESET_EMAIL_ENDPOINT;
    process.env.NODE_ENV = "test";
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;

    if (originalEndpoint === undefined) {
      delete process.env.AUTH_RESET_EMAIL_ENDPOINT;
    } else {
      process.env.AUTH_RESET_EMAIL_ENDPOINT = originalEndpoint;
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

  it("fails in production when no endpoint is configured", async () => {
    process.env.NODE_ENV = "production";

    await expect(
      deliverPasswordReset({
        email: "collector@example.com",
        resetUrl: "https://example.com/reset-password/token"
      })
    ).rejects.toThrow("Password reset email delivery is not configured.");
  });
});
