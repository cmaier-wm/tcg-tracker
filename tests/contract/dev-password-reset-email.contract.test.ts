import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/dev/password-reset-email/route";

describe("dev password reset email route", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalFromEmail = process.env.AUTH_RESET_FROM_EMAIL;
  const originalFromName = process.env.AUTH_RESET_FROM_NAME;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    process.env.NODE_ENV = "test";
    process.env.RESEND_API_KEY = "resend-test-key";
    process.env.AUTH_RESET_FROM_EMAIL = "noreply@example.com";
    process.env.AUTH_RESET_FROM_NAME = "Pokemon TCG Tracker";
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;

    if (originalApiKey === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY = originalApiKey;
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

  it("forwards a valid request to Resend", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      new Request("http://localhost/api/dev/password-reset-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "collector@example.com",
          resetUrl: "http://localhost:3000/reset-password/test-token"
        })
      })
    );

    expect(response.status).toBe(202);
    expect(fetchMock).toHaveBeenCalledWith("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer resend-test-key",
        "Content-Type": "application/json"
      },
      body: expect.stringContaining("\"collector@example.com\"")
    });
  });
});
