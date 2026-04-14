import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST as login } from "@/app/api/auth/login/route";
import { POST as register } from "@/app/api/auth/register/route";
import { POST as logout } from "@/app/api/auth/logout/route";
import { GET as getMobileSession } from "@/app/api/mobile/session/route";

const authSessionMocks = vi.hoisted(() => ({
  createAuthSession: vi.fn(),
  createUserAccountWithCredential: vi.fn(),
  findUserAccountByEmail: vi.fn(),
  getUserCredentialByEmail: vi.fn(),
  requireAuthenticatedUser: vi.fn(),
  invalidateCurrentAuthSession: vi.fn(),
  resolvePostAuthRedirect: vi.fn(),
  setAuthSessionCookie: vi.fn(),
  clearAuthSessionCookie: vi.fn()
}));

const passwordMocks = vi.hoisted(() => ({
  hashPassword: vi.fn(),
  verifyPassword: vi.fn()
}));

const legacyBootstrapMocks = vi.hoisted(() => ({
  claimLegacyBootstrapData: vi.fn()
}));

const auditLogMocks = vi.hoisted(() => ({
  recordAuthAuditEvent: vi.fn()
}));

vi.mock("@/lib/auth/auth-session", () => authSessionMocks);
vi.mock("@/lib/auth/password", () => passwordMocks);
vi.mock("@/lib/auth/legacy-bootstrap", () => legacyBootstrapMocks);
vi.mock("@/lib/auth/audit-log", () => auditLogMocks);

describe("auth contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authSessionMocks.createAuthSession.mockResolvedValue({
      sessionToken: "session-token",
      expiresAt: new Date("2026-04-08T00:00:00.000Z")
    });
    authSessionMocks.resolvePostAuthRedirect.mockImplementation((path: string | null) =>
      path ?? "/portfolio"
    );
    passwordMocks.hashPassword.mockResolvedValue("hashed-password");
    passwordMocks.verifyPassword.mockResolvedValue(true);
    legacyBootstrapMocks.claimLegacyBootstrapData.mockResolvedValue(true);
    auditLogMocks.recordAuthAuditEvent.mockResolvedValue(undefined);
    authSessionMocks.requireAuthenticatedUser.mockResolvedValue({
      userId: "user-1",
      email: "collector@example.com",
      displayName: "Collector"
    });
  });

  it("registers with normalized email and returns the session payload shape", async () => {
    authSessionMocks.findUserAccountByEmail.mockResolvedValue(null);
    authSessionMocks.createUserAccountWithCredential.mockResolvedValue({
      userId: "user-1",
      email: "collector@example.com",
      displayName: "Collector"
    });

    const response = await register(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: " Collector@Example.com ",
          password: "password123",
          returnTo: "/cards/pokemon/card-1"
        })
      })
    );

    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload).toMatchObject({
      userId: "user-1",
      email: "collector@example.com",
      displayName: "Collector",
      returnTo: "/cards/pokemon/card-1"
    });
    expect(authSessionMocks.findUserAccountByEmail).toHaveBeenCalledWith("collector@example.com");
    expect(authSessionMocks.createUserAccountWithCredential).toHaveBeenCalledWith({
      email: "collector@example.com",
      passwordHash: "hashed-password"
    });
    expect(authSessionMocks.setAuthSessionCookie).toHaveBeenCalled();
  });

  it("rejects malformed registration payloads", async () => {
    const response = await register(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: "not-an-email",
          password: "short"
        })
      })
    );

    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("email");
  });

  it("rejects duplicate registration attempts after normalization", async () => {
    authSessionMocks.findUserAccountByEmail.mockResolvedValue({
      userId: "user-1",
      email: "collector@example.com",
      displayName: "Collector"
    });

    const response = await register(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: "COLLECTOR@example.com",
          password: "password123"
        })
      })
    );

    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe("An account already exists for that email address.");
  });

  it("surfaces a database migration problem with a useful registration error", async () => {
    authSessionMocks.findUserAccountByEmail.mockRejectedValue(
      new Error("The column `UserAccount.isLegacyDefault` does not exist in the current database.")
    );

    const response = await register(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: "collector@example.com",
          password: "password123"
        })
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toContain("UserAccount.isLegacyDefault");
  });

  it("logs in with normalized email and rejects invalid credentials", async () => {
    authSessionMocks.getUserCredentialByEmail.mockResolvedValue({
      user: {
        userId: "user-1",
        email: "collector@example.com",
        displayName: "Collector"
      },
      passwordHash: "hashed-password"
    });

    const successResponse = await login(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: " Collector@Example.com ",
          password: "password123",
          returnTo: "/cards"
        })
      })
    );

    expect(successResponse.status).toBe(200);
    expect(authSessionMocks.getUserCredentialByEmail).toHaveBeenCalledWith(
      "collector@example.com"
    );

    passwordMocks.verifyPassword.mockResolvedValueOnce(false);

    const failureResponse = await login(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: "collector@example.com",
          password: "wrong-password"
        })
      })
    );

    const failurePayload = await failureResponse.json();

    expect(failureResponse.status).toBe(401);
    expect(failurePayload.error).toBe("Invalid email or password.");
  });

  it("invalidates the current session on logout", async () => {
    const response = await logout();

    expect(response.status).toBe(204);
    expect(authSessionMocks.invalidateCurrentAuthSession).toHaveBeenCalledTimes(1);
    expect(authSessionMocks.clearAuthSessionCookie).toHaveBeenCalledTimes(1);
  });

  it("uses the same authenticated user shape for mobile session bootstrap", async () => {
    const response = await getMobileSession();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.user).toMatchObject({
      userId: "user-1",
      email: "collector@example.com",
      displayName: "Collector"
    });
  });
});
