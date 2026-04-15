import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { recordAuthAuditEvent } from "@/lib/auth/audit-log";
import {
  PasswordResetTokenError,
  resetPasswordFromToken
} from "@/lib/auth/password-reset";
import {
  passwordResetConfirmResponseSchema,
  passwordResetConfirmSchema
} from "@/lib/auth/schemas";

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

function getConfirmErrorMessage(error: unknown) {
  if (error instanceof Error && process.env.NODE_ENV !== "production") {
    return `Password reset failed: ${error.message}`;
  }

  return "Password reset is unavailable right now. Try again later.";
}

export async function POST(request: Request) {
  try {
    const payload = passwordResetConfirmSchema.parse(await request.json());
    const result = await resetPasswordFromToken(payload);
    const response = passwordResetConfirmResponseSchema.parse(result);

    return NextResponse.json(response);
  } catch (error) {
    await safeRecordAuthAuditEvent({
      eventType: "password_reset_confirm",
      outcome: "failed",
      detail: error instanceof Error ? error.message : "Password reset failed."
    });

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Password reset failed." },
        { status: 400 }
      );
    }

    if (error instanceof PasswordResetTokenError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: getConfirmErrorMessage(error) },
      { status: 500 }
    );
  }
}
