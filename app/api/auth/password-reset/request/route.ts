import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { recordAuthAuditEvent } from "@/lib/auth/audit-log";
import {
  buildPasswordResetUrl,
  createPasswordResetRequest,
  getPasswordResetRequestAcceptedMessage
} from "@/lib/auth/password-reset";
import { deliverPasswordReset } from "@/lib/auth/reset-delivery";
import { passwordResetRequestSchema } from "@/lib/auth/schemas";

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

function getRequestErrorMessage(error: unknown) {
  if (error instanceof Error && process.env.NODE_ENV !== "production") {
    return `Password reset request failed: ${error.message}`;
  }

  return "Password reset is unavailable right now. Try again later.";
}

export async function POST(request: Request) {
  try {
    const payload = passwordResetRequestSchema.parse(await request.json());
    const result = await createPasswordResetRequest(payload.email);

    if (result.resetToken) {
      await deliverPasswordReset({
        email: result.email,
        resetUrl: buildPasswordResetUrl(result.resetToken)
      });
    }

    return NextResponse.json(
      { message: getPasswordResetRequestAcceptedMessage() },
      { status: 202 }
    );
  } catch (error) {
    await safeRecordAuthAuditEvent({
      eventType: "password_reset_request",
      outcome: "failed",
      detail: error instanceof Error ? error.message : "Password reset request failed."
    });

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Password reset request failed." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: getRequestErrorMessage(error) },
      { status: 500 }
    );
  }
}
