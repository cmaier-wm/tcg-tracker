import crypto from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getDemoStore, findDemoUserByEmail } from "@/lib/db/demo-store";
import { withDatabaseFallback } from "@/lib/db/runtime";
import {
  getPasswordResetExpiryDate,
  PASSWORD_RESET_REQUEST_ROUTE
} from "@/lib/auth/auth-config";
import { recordAuthAuditEvent } from "@/lib/auth/audit-log";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { normalizeEmail } from "@/lib/auth/schemas";

const PASSWORD_RESET_REQUEST_ACCEPTED_MESSAGE =
  "If an account exists for that email, a password reset link has been sent.";

const PASSWORD_RESET_SUCCESS_MESSAGE =
  "Your password has been updated. Sign in with your new password.";

export class PasswordResetTokenError extends Error {
  status: number;

  constructor(message: string, status = 410) {
    super(message);
    this.name = "PasswordResetTokenError";
    this.status = status;
  }
}

export type PasswordResetTokenStatus =
  | { state: "valid" }
  | { state: "invalid"; message: string };

function createResetSecret() {
  return crypto.randomBytes(24).toString("base64url");
}

function hashResetSecret(secret: string) {
  return crypto.createHash("sha256").update(secret).digest("hex");
}

function createResetTokenValue(id: string, secret: string) {
  return `${id}.${secret}`;
}

function parseResetTokenValue(token: string) {
  const [id, secret, ...rest] = token.split(".");

  if (!id || !secret || rest.length > 0) {
    return null;
  }

  return { id, secret };
}

async function revokeResetTokensForUser(userId: string) {
  return withDatabaseFallback(
    async () => {
      await prisma.passwordResetToken.updateMany({
        where: {
          userId,
          usedAt: null,
          revokedAt: null,
          expiresAt: { gt: new Date() }
        },
        data: {
          revokedAt: new Date()
        }
      });
    },
    async () => {
      const store = getDemoStore();
      const now = new Date().toISOString();
      store.passwordResetTokens = store.passwordResetTokens.map((token) => {
        if (
          token.userId === userId &&
          token.usedAt === null &&
          token.revokedAt === null &&
          new Date(token.expiresAt) > new Date()
        ) {
          return {
            ...token,
            revokedAt: now
          };
        }

        return token;
      });
    }
  );
}

export async function createPasswordResetRequest(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const secret = createResetSecret();
  const tokenHash = hashResetSecret(secret);
  const expiresAt = getPasswordResetExpiryDate();

  return withDatabaseFallback(
    async () => {
      const credential = await prisma.userCredential.findUnique({
        where: { normalizedEmail },
        include: { user: true }
      });

      if (!credential) {
        await recordAuthAuditEvent({
          eventType: "password_reset_request",
          outcome: "accepted"
        });

        return {
          accepted: true,
          email: normalizedEmail,
          resetToken: null as string | null
        };
      }

      const created = await prisma.$transaction(async (tx) => {
        await tx.passwordResetToken.updateMany({
          where: {
            userId: credential.userId,
            usedAt: null,
            revokedAt: null,
            expiresAt: { gt: new Date() }
          },
          data: {
            revokedAt: new Date()
          }
        });

        return tx.passwordResetToken.create({
          data: {
            userId: credential.userId,
            tokenHash,
            expiresAt
          }
        });
      });
      await recordAuthAuditEvent({
        userId: credential.userId,
        eventType: "password_reset_request",
        outcome: "accepted"
      });

      return {
        accepted: true,
        email: normalizedEmail,
        resetToken: createResetTokenValue(created.id, secret)
      };
    },
    async () => {
      const user = findDemoUserByEmail(normalizedEmail);

      if (!user) {
        await recordAuthAuditEvent({
          eventType: "password_reset_request",
          outcome: "accepted"
        });

        return {
          accepted: true,
          email: normalizedEmail,
          resetToken: null as string | null
        };
      }

      const store = getDemoStore();
      const now = new Date().toISOString();
      store.passwordResetTokens = store.passwordResetTokens.map((token) => {
        if (
          token.userId === user.id &&
          token.usedAt === null &&
          token.revokedAt === null &&
          new Date(token.expiresAt) > new Date()
        ) {
          return {
            ...token,
            revokedAt: now
          };
        }

        return token;
      });

      const created = {
        id: `reset-${Math.random().toString(36).slice(2, 10)}`,
        userId: user.id,
        tokenHash,
        expiresAt: expiresAt.toISOString(),
        usedAt: null,
        revokedAt: null,
        createdAt: now
      };

      store.passwordResetTokens.push(created);

      await recordAuthAuditEvent({
        userId: user.id,
        eventType: "password_reset_request",
        outcome: "accepted"
      });

      return {
        accepted: true,
        email: normalizedEmail,
        resetToken: createResetTokenValue(created.id, secret)
      };
    }
  );
}

export function buildPasswordResetUrl(token: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    "http://localhost:3000";

  return new URL(
    `${PASSWORD_RESET_REQUEST_ROUTE}/${encodeURIComponent(token)}`,
    baseUrl
  ).toString();
}

type PasswordResetResult = {
  message: string;
};

export async function resetPasswordFromToken(input: {
  token: string;
  password: string;
}): Promise<PasswordResetResult> {
  const parsedToken = parseResetTokenValue(input.token);

  if (!parsedToken) {
    await recordAuthAuditEvent({
      eventType: "password_reset_confirm",
      outcome: "invalid_token"
    });
    throw new PasswordResetTokenError(
      "This password reset link is invalid or has expired. Request a new reset link."
    );
  }

  const secretHash = hashResetSecret(parsedToken.secret);

  return withDatabaseFallback(
    async () => {
      const token = await prisma.passwordResetToken.findUnique({
        where: { id: parsedToken.id },
        include: {
          user: {
            include: {
              credential: true
            }
          }
        }
      });

      if (!token || token.tokenHash !== secretHash || !token.user.credential) {
        await recordAuthAuditEvent({
          eventType: "password_reset_confirm",
          outcome: "invalid_token"
        });
        throw new PasswordResetTokenError(
          "This password reset link is invalid or has expired. Request a new reset link."
        );
      }

      if (token.usedAt || token.revokedAt || token.expiresAt <= new Date()) {
        await recordAuthAuditEvent({
          userId: token.userId,
          eventType: "password_reset_confirm",
          outcome: token.expiresAt <= new Date() ? "expired" : "invalid_token"
        });
        throw new PasswordResetTokenError(
          "This password reset link is invalid or has expired. Request a new reset link."
        );
      }

      const isCurrentPassword = await verifyPassword(
        input.password,
        token.user.credential.passwordHash
      );

      if (isCurrentPassword) {
        await recordAuthAuditEvent({
          userId: token.userId,
          eventType: "password_reset_confirm",
          outcome: "failed",
          detail: "Current password cannot be reused."
        });
        throw new PasswordResetTokenError(
          "Choose a new password that is different from your current password.",
          400
        );
      }

      const passwordHash = await hashPassword(input.password);

      await prisma.$transaction(async (tx) => {
        await tx.userCredential.update({
          where: { userId: token.userId },
          data: { passwordHash }
        });

        await tx.passwordResetToken.update({
          where: { id: token.id },
          data: { usedAt: new Date() }
        });

        await tx.passwordResetToken.updateMany({
          where: {
            userId: token.userId,
            id: { not: token.id },
            usedAt: null,
            revokedAt: null
          },
          data: { revokedAt: new Date() }
        });

        await tx.authSession.deleteMany({
          where: { userId: token.userId }
        });

        await tx.authAuditEvent.create({
          data: {
            userId: token.userId,
            eventType: "password_reset_confirm",
            outcome: "success"
          }
        });
      });

      return { message: PASSWORD_RESET_SUCCESS_MESSAGE };
    },
    async () => {
      const store = getDemoStore();
      const token = store.passwordResetTokens.find((item) => item.id === parsedToken.id);

      if (!token || token.tokenHash !== secretHash) {
        await recordAuthAuditEvent({
          eventType: "password_reset_confirm",
          outcome: "invalid_token"
        });
        throw new PasswordResetTokenError(
          "This password reset link is invalid or has expired. Request a new reset link."
        );
      }

      const credential = store.credentials.find((item) => item.userId === token.userId);

      if (!credential || token.usedAt || token.revokedAt || new Date(token.expiresAt) <= new Date()) {
        await recordAuthAuditEvent({
          userId: token.userId,
          eventType: "password_reset_confirm",
          outcome: new Date(token.expiresAt) <= new Date() ? "expired" : "invalid_token"
        });
        throw new PasswordResetTokenError(
          "This password reset link is invalid or has expired. Request a new reset link."
        );
      }

      const isCurrentPassword = await verifyPassword(input.password, credential.passwordHash);

      if (isCurrentPassword) {
        await recordAuthAuditEvent({
          userId: token.userId,
          eventType: "password_reset_confirm",
          outcome: "failed",
          detail: "Current password cannot be reused."
        });
        throw new PasswordResetTokenError(
          "Choose a new password that is different from your current password.",
          400
        );
      }

      credential.passwordHash = await hashPassword(input.password);
      credential.updatedAt = new Date().toISOString();
      token.usedAt = new Date().toISOString();
      await revokeResetTokensForUser(token.userId);
      token.revokedAt = null;
      store.sessions = store.sessions.filter((session) => session.userId !== token.userId);

      await recordAuthAuditEvent({
        userId: token.userId,
        eventType: "password_reset_confirm",
        outcome: "success"
      });

      return { message: PASSWORD_RESET_SUCCESS_MESSAGE };
    }
  );
}

export function getPasswordResetRequestAcceptedMessage() {
  return PASSWORD_RESET_REQUEST_ACCEPTED_MESSAGE;
}

export async function getPasswordResetTokenStatus(
  tokenValue: string
): Promise<PasswordResetTokenStatus> {
  const parsedToken = parseResetTokenValue(tokenValue);

  if (!parsedToken) {
    return {
      state: "invalid",
      message: "This password reset link is invalid or has expired. Request a new reset link."
    };
  }

  const secretHash = hashResetSecret(parsedToken.secret);

  return withDatabaseFallback(
    async () => {
      const token = await prisma.passwordResetToken.findUnique({
        where: { id: parsedToken.id },
        include: {
          user: {
            include: {
              credential: true
            }
          }
        }
      });

      if (
        !token ||
        !token.user.credential ||
        token.tokenHash !== secretHash ||
        token.usedAt ||
        token.revokedAt ||
        token.expiresAt <= new Date()
      ) {
        return {
          state: "invalid" as const,
          message:
            "This password reset link is invalid or has expired. Request a new reset link."
        };
      }

      return { state: "valid" as const };
    },
    async () => {
      const store = getDemoStore();
      const token = store.passwordResetTokens.find((item) => item.id === parsedToken.id);
      const credential = token
        ? store.credentials.find((item) => item.userId === token.userId)
        : null;

      if (
        !token ||
        !credential ||
        token.tokenHash !== secretHash ||
        token.usedAt ||
        token.revokedAt ||
        new Date(token.expiresAt) <= new Date()
      ) {
        return {
          state: "invalid" as const,
          message:
            "This password reset link is invalid or has expired. Request a new reset link."
        };
      }

      return { state: "valid" as const };
    }
  );
}
