type DeliverPasswordResetInput = {
  email: string;
  resetUrl: string;
};

export async function deliverPasswordReset(input: DeliverPasswordResetInput) {
  const endpoint = process.env.AUTH_RESET_EMAIL_ENDPOINT?.trim();

  if (endpoint) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      throw new Error(`Password reset delivery failed with status ${response.status}.`);
    }

    return;
  }

  if (process.env.NODE_ENV !== "production") {
    console.info(
      `[password-reset] ${input.email} ${input.resetUrl}`
    );
    return;
  }

  throw new Error("Password reset email delivery is not configured.");
}
