import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import {
  createDemoUserAccount,
  findDemoUserByEmail,
  getDemoStore,
  type DemoUserAccount
} from "@/lib/db/demo-store";
import { withDatabaseFallback } from "@/lib/db/runtime";
import { unauthorized } from "@/lib/api/http-errors";
import {
  AUTH_SESSION_COOKIE_NAME,
  AUTH_SESSION_MAX_AGE_SECONDS,
  getAuthCookieSecure,
  getAuthSessionExpiryDate,
  getPostAuthRedirect,
  isSafeReturnToPath
} from "@/lib/auth/auth-config";
import { normalizeEmail } from "@/lib/auth/schemas";

export type AuthenticatedUser = {
  userId: string;
  email: string;
  displayName: string;
};

let testAuthenticatedUser: AuthenticatedUser | null | undefined;

const DEFAULT_TEST_AUTHENTICATED_USER: AuthenticatedUser = {
  userId: "demo-user",
  email: "collector@local.tcg",
  displayName: "Collector"
};

function createSessionToken() {
  return crypto.randomBytes(24).toString("base64url");
}

function mapUser(user: {
  id: string;
  email: string;
  displayName: string;
}): AuthenticatedUser {
  return {
    userId: user.id,
    email: user.email,
    displayName: user.displayName
  };
}

function getDisplayNameFromEmail(email: string) {
  const localPart = email.trim().split("@")[0] ?? "collector";
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
    .join(" ") || "Collector";
}

export function getValidatedReturnTo(path: string | null | undefined) {
  return isSafeReturnToPath(path) ? path : null;
}

export function resolvePostAuthRedirect(path: string | null | undefined) {
  return getPostAuthRedirect(path);
}

export async function setAuthSessionCookie(sessionToken: string, expiresAt: Date) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: getAuthCookieSecure(),
    expires: expiresAt,
    maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
    path: "/"
  });
}

export async function clearAuthSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: getAuthCookieSecure(),
    expires: new Date(0),
    maxAge: 0,
    path: "/"
  });
}

async function getCurrentSessionToken() {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(AUTH_SESSION_COOKIE_NAME)?.value ?? null;
  } catch {
    return null;
  }
}

export async function createAuthSession(userId: string) {
  const sessionToken = createSessionToken();
  const expiresAt = getAuthSessionExpiryDate();

  await withDatabaseFallback(
    async () => {
      await prisma.authSession.create({
        data: {
          userId,
          sessionToken,
          expiresAt
        }
      });
    },
    async () => {
      getDemoStore().sessions.push({
        id: `session-${Math.random().toString(36).slice(2, 10)}`,
        userId,
        sessionToken,
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  );

  return { sessionToken, expiresAt };
}

export async function invalidateCurrentAuthSession() {
  const sessionToken = await getCurrentSessionToken();

  if (!sessionToken) {
    await clearAuthSessionCookie();
    return;
  }

  await withDatabaseFallback(
    async () => {
      await prisma.authSession.deleteMany({
        where: { sessionToken }
      });
    },
    async () => {
      const store = getDemoStore();
      store.sessions = store.sessions.filter((session) => session.sessionToken !== sessionToken);
    }
  );

  await clearAuthSessionCookie();
}

async function getDatabaseSessionUser(sessionToken: string) {
  const session = await prisma.authSession.findUnique({
    where: { sessionToken },
    include: { user: true }
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt <= new Date()) {
    await prisma.authSession.delete({
      where: { sessionToken }
    });
    return null;
  }

  return mapUser(session.user);
}

async function getDemoSessionUser(sessionToken: string) {
  const store = getDemoStore();
  const session = store.sessions.find((item) => item.sessionToken === sessionToken);

  if (!session) {
    return null;
  }

  if (new Date(session.expiresAt) <= new Date()) {
    store.sessions = store.sessions.filter((item) => item.sessionToken !== sessionToken);
    return null;
  }

  const user = store.users.find((item) => item.id === session.userId);
  return user ? mapUser(user) : null;
}

export async function getOptionalAuthenticatedUser() {
  if (process.env.NODE_ENV === "test") {
    if (testAuthenticatedUser !== undefined) {
      return testAuthenticatedUser;
    }

    return DEFAULT_TEST_AUTHENTICATED_USER;
  }

  const sessionToken = await getCurrentSessionToken();

  if (!sessionToken) {
    return null;
  }

  return withDatabaseFallback(
    async () => getDatabaseSessionUser(sessionToken),
    async () => getDemoSessionUser(sessionToken)
  );
}

export async function requireAuthenticatedUser() {
  const user = await getOptionalAuthenticatedUser();

  if (!user) {
    throw unauthorized("Authentication is required.");
  }

  return user;
}

export function setTestAuthenticatedUser(user: AuthenticatedUser | null | undefined) {
  testAuthenticatedUser = user;
}

export async function getUserCredentialByEmail(normalizedEmail: string) {
  return withDatabaseFallback(
    async () => {
      const credential = await prisma.userCredential.findUnique({
        where: { normalizedEmail },
        include: { user: true }
      });

      if (!credential) {
        return null;
      }

      return {
        user: mapUser(credential.user),
        passwordHash: credential.passwordHash
      };
    },
    async () => {
      const store = getDemoStore();
      const credential = store.credentials.find((item) => item.normalizedEmail === normalizedEmail);

      if (!credential) {
        return null;
      }

      const user = store.users.find((item) => item.id === credential.userId);

      if (!user) {
        return null;
      }

      return {
        user: mapUser(user),
        passwordHash: credential.passwordHash
      };
    }
  );
}

export async function createUserAccountWithCredential(input: {
  email: string;
  passwordHash: string;
}) {
  const normalizedEmail = normalizeEmail(input.email);
  const displayName = getDisplayNameFromEmail(input.email);

  return withDatabaseFallback(
    async () => {
      const user = await prisma.userAccount.create({
        data: {
          email: normalizedEmail,
          displayName,
          credential: {
            create: {
              normalizedEmail,
              passwordHash: input.passwordHash
            }
          }
        }
      });

      return mapUser(user);
    },
    async () => {
      const existing = findDemoUserByEmail(normalizedEmail);

      if (existing) {
        return null;
      }

      const user = createDemoUserAccount({
        id: `user-${Math.random().toString(36).slice(2, 10)}`,
        email: normalizedEmail,
        displayName
      });

      const now = new Date().toISOString();
      getDemoStore().credentials.push({
        userId: user.id,
        normalizedEmail,
        passwordHash: input.passwordHash,
        createdAt: now,
        updatedAt: now
      });

      return mapUser(user);
    }
  );
}

export async function findUserAccountByEmail(normalizedEmail: string) {
  return withDatabaseFallback(
    async () => {
      const user = await prisma.userAccount.findUnique({
        where: { email: normalizedEmail }
      });

      return user ? mapUser(user) : null;
    },
    async () => {
      const user = findDemoUserByEmail(normalizedEmail);
      return user ? mapUser(user) : null;
    }
  );
}

export async function attachCredentialToExistingAccount(input: {
  email: string;
  passwordHash: string;
}) {
  const normalizedEmail = normalizeEmail(input.email);

  return withDatabaseFallback(
    async () => {
      const user = await prisma.userAccount.findUnique({
        where: { email: normalizedEmail },
        include: { credential: true }
      });

      if (!user || user.credential) {
        return null;
      }

      const updatedUser = await prisma.userAccount.update({
        where: { id: user.id },
        data: {
          credential: {
            create: {
              normalizedEmail,
              passwordHash: input.passwordHash
            }
          }
        }
      });

      return mapUser(updatedUser);
    },
    async () => {
      const user = findDemoUserByEmail(normalizedEmail);

      if (!user) {
        return null;
      }

      const store = getDemoStore();
      const existingCredential = store.credentials.find((item) => item.userId === user.id);

      if (existingCredential) {
        return null;
      }

      const now = new Date().toISOString();
      store.credentials.push({
        userId: user.id,
        normalizedEmail,
        passwordHash: input.passwordHash,
        createdAt: now,
        updatedAt: now
      });

      return mapUser(user);
    }
  );
}

export async function findLegacyUserAccount() {
  return withDatabaseFallback<{ id: string } | null>(
    async () => {
      const user = await prisma.userAccount.findFirst({
        where: {
          isLegacyDefault: true,
          legacyClaimedAt: null
        },
        select: {
          id: true
        }
      });

      return user ? { id: user.id } : null;
    },
    async () => {
      const user = getDemoStore().users.find(
        (item) => item.isLegacyDefault && !item.legacyClaimedAt
      );

      return user ? { id: user.id } : null;
    }
  );
}

export function mapDemoUser(user: DemoUserAccount) {
  return mapUser(user);
}
