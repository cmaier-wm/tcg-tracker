import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/mobile/session/route";
import { unauthorized } from "@/lib/api/http-errors";

const authSessionMocks = vi.hoisted(() => ({
  requireAuthenticatedUser: vi.fn()
}));

vi.mock("@/lib/auth/auth-session", () => authSessionMocks);

describe("mobile session contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the documented authenticated mobile session payload", async () => {
    authSessionMocks.requireAuthenticatedUser.mockResolvedValue({
      userId: "user-1",
      email: "collector@example.com",
      displayName: "Collector"
    });

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      status: "authenticated",
      user: {
        userId: "user-1",
        email: "collector@example.com",
        displayName: "Collector"
      }
    });
  });

  it("rejects missing authenticated sessions", async () => {
    authSessionMocks.requireAuthenticatedUser.mockRejectedValue(
      unauthorized("Authentication is required.")
    );

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toBe("Authentication is required.");
  });
});
