type PasswordResetEmailInput = {
  email: string;
  resetUrl: string;
};

function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.AUTH_RESET_FROM_EMAIL?.trim();
  const fromName = process.env.AUTH_RESET_FROM_NAME?.trim() ?? "Pokémon TCG Tracker";

  if (!apiKey || !fromEmail) {
    return null;
  }

  return {
    apiKey,
    from: `${fromName} <${fromEmail}>`
  };
}

export function canSendPasswordResetWithResend() {
  return getResendConfig() !== null;
}

export async function sendPasswordResetWithResend(input: PasswordResetEmailInput) {
  const config = getResendConfig();

  if (!config) {
    throw new Error("Resend password reset email delivery is not configured.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: config.from,
      to: [input.email],
      subject: "Reset your Pokémon TCG Tracker password",
      text: [
        "A password reset was requested for your Pokémon TCG Tracker account.",
        "",
        `Open this link to choose a new password: ${input.resetUrl}`,
        "",
        "If you did not request this, you can ignore this email."
      ].join("\n"),
      html: [
        "<p>A password reset was requested for your Pokémon TCG Tracker account.</p>",
        `<p><a href="${input.resetUrl}">Open this link to choose a new password</a></p>`,
        "<p>If you did not request this, you can ignore this email.</p>"
      ].join("")
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend request failed with status ${response.status}: ${detail}`);
  }
}
