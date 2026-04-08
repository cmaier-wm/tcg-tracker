import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { unauthorized } from "@/lib/api/http-errors";
import {
  createAuthSession,
  getUserCredentialByEmail,
  resolvePostAuthRedirect,
  setAuthSessionCookie
} from "@/lib/auth/auth-session";
import { verifyPassword } from "@/lib/auth/password";
import { loginRequestSchema } from "@/lib/auth/schemas";
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

export async function POST(request: Request) {
  try {
    const payload = loginRequestSchema.parse(await request.json());
    const credential = await getUserCredentialByEmail(payload.email);

    if (!credential) {
      throw unauthorized("Invalid email or password.");
    }

    const isValid = await verifyPassword(payload.password, credential.passwordHash);

    if (!isValid) {
      throw unauthorized("Invalid email or password.");
    }

    const session = await createAuthSession(credential.user.userId);
    await setAuthSessionCookie(session.sessionToken, session.expiresAt);
    await safeRecordAuthAuditEvent({
      userId: credential.user.userId,
      eventType: "login",
      outcome: "success"
    });

    return NextResponse.json({
      userId: credential.user.userId,
      email: credential.user.email,
      displayName: credential.user.displayName,
      returnTo: resolvePostAuthRedirect(payload.returnTo)
    });
  } catch (error) {
    await safeRecordAuthAuditEvent({
      eventType: "login",
      outcome: "failed",
      detail: error instanceof Error ? error.message : "Login failed."
    });

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Login failed." },
        { status: 400 }
      );
    }

    if (error instanceof Error && "status" in error) {
      const status = (error as { status: number }).status;
      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json({ error: "Login failed." }, { status: 400 });
  }
}
