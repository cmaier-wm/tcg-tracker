import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  email: z.string().trim().email(),
  resetUrl: z.string().trim().url()
});

function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.AUTH_RESET_FROM_EMAIL?.trim();
  const fromName = process.env.AUTH_RESET_FROM_NAME?.trim() ?? "Pokemon TCG Tracker";

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  if (!fromEmail) {
    throw new Error("AUTH_RESET_FROM_EMAIL is not configured.");
  }

  return {
    apiKey,
    from: `${fromName} <${fromEmail}>`
  };
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  try {
    const payload = requestSchema.parse(await request.json());
    const { apiKey, from } = getResendConfig();
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [payload.email],
        subject: "Reset your Pokemon TCG Tracker password",
        text: [
          "A password reset was requested for your Pokemon TCG Tracker account.",
          "",
          `Open this link to choose a new password: ${payload.resetUrl}`,
          "",
          "If you did not request this, you can ignore this email."
        ].join("\n"),
        html: [
          "<p>A password reset was requested for your Pokemon TCG Tracker account.</p>",
          `<p><a href="${payload.resetUrl}">Open this link to choose a new password</a></p>`,
          "<p>If you did not request this, you can ignore this email.</p>"
        ].join("")
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Resend request failed with status ${response.status}: ${detail}`);
    }

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
