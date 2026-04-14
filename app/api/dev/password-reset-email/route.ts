import { NextResponse } from "next/server";
import { z } from "zod";
import { sendPasswordResetWithResend } from "@/lib/auth/resend-email";

const requestSchema = z.object({
  email: z.string().trim().email(),
  resetUrl: z.string().trim().url()
});

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  try {
    const payload = requestSchema.parse(await request.json());
    await sendPasswordResetWithResend(payload);

    return NextResponse.json({ ok: true }, { status: 202 });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message ?? "Invalid request."
        : error instanceof Error
          ? error.message
          : "Unable to send password reset email.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
