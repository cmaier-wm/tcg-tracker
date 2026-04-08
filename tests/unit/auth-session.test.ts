import { beforeEach, describe, expect, it, vi } from "vitest";
import { HttpError } from "@/lib/api/http-errors";
import { resolvePostAuthRedirect } from "@/lib/auth/auth-session";
import { requireApiAuth, requirePageAuth } from "@/lib/auth/route-guards";

const authSessionMocks = vi.hoisted(() => ({
  getOptionalAuthenticatedUser: vi.fn(),
  getValidatedReturnTo: vi.fn()
}));

const redirectMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/auth-session", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth/auth-session")>();

  return {
    ...actual,
    getOptionalAuthenticatedUser: authSessionMocks.getOptionalAuthenticatedUser,
    getValidatedReturnTo: authSessionMocks.getValidatedReturnTo
  };
});

vi.mock("next/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/navigation")>();

  return {
    ...actual,
    redirect: redirectMock
  };
});

describe("auth session helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authSessionMocks.getValidatedReturnTo.mockImplementation((path: string | undefined) => path ?? null);
  });

  it("keeps safe public returnTo destinations and falls back for unsafe paths", () => {
    expect(resolvePostAuthRedirect("/cards")).toBe("/cards");
    expect(resolvePostAuthRedirect("/cards/pokemon/card-1")).toBe("/cards/pokemon/card-1");
    expect(resolvePostAuthRedirect("/settings")).toBe("/portfolio");
    expect(resolvePostAuthRedirect("https://example.com")).toBe("/portfolio");
  });

  it("returns the authenticated user from page and api guards", async () => {
    authSessionMocks.getOptionalAuthenticatedUser.mockResolvedValue({
      userId: "user-1",
      email: "collector@example.com",
      displayName: "Collector"
    });

    await expect(requirePageAuth("/portfolio")).resolves.toMatchObject({
      userId: "user-1"
    });
    await expect(requireApiAuth()).resolves.toMatchObject({
      userId: "user-1"
    });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("redirects unauthenticated page access and rejects unauthenticated api access", async () => {
    authSessionMocks.getOptionalAuthenticatedUser.mockResolvedValue(null);
    authSessionMocks.getValidatedReturnTo.mockReturnValue("/portfolio");

    await requirePageAuth("/portfolio");
    expect(redirectMock).toHaveBeenCalledWith("/login?returnTo=%2Fportfolio");

    await expect(requireApiAuth()).rejects.toMatchObject<HttpError>({
      status: 401,
      message: "Authentication is required."
    });
  });
});
