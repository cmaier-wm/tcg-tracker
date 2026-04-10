import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { badRequest } from "@/lib/api/http-errors";
import {
  createAuthSession,
  createUserAccountWithCredential,
  findUserAccountByEmail,
  resolvePostAuthRedirect,
  setAuthSessionCookie
} from "@/lib/auth/auth-session";
import { claimLegacyBootstrapData } from "@/lib/auth/legacy-bootstrap";
import { hashPassword } from "@/lib/auth/password";
import { registerRequestSchema } from "@/lib/auth/schemas";
import { recordAuthAuditEvent } from "@/lib/auth/audit-log";

async function safeRecordAuthAuditEvent(input: {
  userId?: string | null;
  eventType: string;
  outcome: string;
  detail?: string | null;
}) {
  try {
    await recordAuthAuditEvent(input);
  } catch (error) {
    console.error("Unable to record auth audit event.", error);
  }
}

function getRegistrationErrorMessage(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2021" || error.code === "P2022")
  ) {
    if (process.env.NODE_ENV === "production") {
      return "Registration is unavailable because the deployed database schema is out of date. Apply the latest Prisma migrations and try again.";
    }

    return "Registration is unavailable because the local database schema is out of date. Run npm run db:migrate and try again.";
  }

  if (error instanceof Error && process.env.NODE_ENV !== "production") {
    return `Registration failed: ${error.message}`;
  }

  return "Registration failed due to a server error.";
}

export async function POST(request: Request) {
  try {
    const payload = registerRequestSchema.parse(await request.json());
    const existing = await findUserAccountByEmail(payload.email);

    if (existing) {
      throw badRequest("An account already exists for that email address.");
    }

    const passwordHash = await hashPassword(payload.password);
    const user = await createUserAccountWithCredential({
      email: payload.email,
      passwordHash
    });

    if (!user) {
      throw badRequest("An account already exists for that email address.");
    }

    await claimLegacyBootstrapData(user.userId);

    const session = await createAuthSession(user.userId);
    await setAuthSessionCookie(session.sessionToken, session.expiresAt);
    await safeRecordAuthAuditEvent({
      userId: user.userId,
      eventType: "register",
      outcome: "success"
    });

    return NextResponse.json(
      {
        userId: user.userId,
        email: user.email,
        displayName: user.displayName,
        returnTo: resolvePostAuthRedirect(payload.returnTo)
      },
      { status: 201 }
    );
  } catch (error) {
    await safeRecordAuthAuditEvent({
      eventType: "register",
      outcome: "failed",
      detail: error instanceof Error ? error.message : "Registration failed."
    });

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Registration failed." },
        { status: 400 }
      );
    }

    if (error instanceof Error && "status" in error) {
      const status = (error as { status: number }).status;
      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json(
      { error: getRegistrationErrorMessage(error) },
      { status: 500 }
    );
  }
}
