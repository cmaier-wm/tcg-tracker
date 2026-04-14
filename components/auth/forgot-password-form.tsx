"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  passwordResetRequestAcceptedSchema,
  passwordResetRequestSchema
} from "@/lib/auth/schemas";

const DEFAULT_SUCCESS_MESSAGE =
  "If an account exists for that email, a password reset link has been sent.";

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = passwordResetRequestSchema.safeParse({ email });

    if (!parsed.success) {
      const nextError =
        parsed.error.issues[0]?.message ?? "Unable to request a password reset.";
      setErrorMessage(nextError);
      toast.error(nextError);
      return;
    }

    startTransition(async () => {
      setErrorMessage(null);

      const response = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const rawPayload = await response.json().catch(() => ({
        message: DEFAULT_SUCCESS_MESSAGE,
        error: "Unable to request a password reset."
      }));

      if (!response.ok) {
        const nextError =
          typeof rawPayload.error === "string"
            ? rawPayload.error
            : "Unable to request a password reset.";
        setErrorMessage(nextError);
        toast.error(nextError);
        return;
      }

      const payload = passwordResetRequestAcceptedSchema.safeParse(rawPayload);
      const nextMessage = payload.success ? payload.data.message : DEFAULT_SUCCESS_MESSAGE;
      setErrorMessage(null);
      toast.success(nextMessage);
    });
  }

  return (
    <form className="surface-card stack" onSubmit={onSubmit} noValidate>
      <div className="section-heading">
        <div>
          <h1>Reset Password</h1>
          <p className="muted">
            Enter your account email address and we&apos;ll send a password reset
            link if the account exists.
          </p>
        </div>
      </div>
      <label className="field">
        Email
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isPending}
          required
        />
      </label>
      {errorMessage ? (
        <p className="muted" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <button className="button" type="submit" disabled={isPending}>
        {isPending ? "Sending Reset Link..." : "Send Reset Link"}
      </button>
      <Link href="/login" className="button secondary">
        Back to Sign In
      </Link>
    </form>
  );
}
