"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { passwordResetConfirmSchema } from "@/lib/auth/schemas";

type ResetPasswordFormProps = {
  token: string;
  initialErrorMessage?: string | null;
};

export function ResetPasswordForm({
  token,
  initialErrorMessage = null
}: ResetPasswordFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (initialErrorMessage) {
      toast.error(initialErrorMessage);
    }
  }, [initialErrorMessage]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = passwordResetConfirmSchema.safeParse({ token, password });

    if (!parsed.success) {
      const nextError =
        parsed.error.issues[0]?.message ?? "Unable to reset password.";
      toast.error(nextError);
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token, password })
      });

      const payload = await response
        .json()
        .catch(() => ({ error: "Unable to reset password." }));

      if (!response.ok) {
        const nextError = payload.error ?? "Unable to reset password.";
        toast.error(nextError);
        return;
      }

      toast.success(payload.message ?? "Your password has been updated.");
      router.push("/login");
      router.refresh();
    });
  }

  if (initialErrorMessage) {
    return (
      <section className="surface-card stack">
        <div className="section-heading">
          <div>
            <h1>Reset Link Unavailable</h1>
            <p className="muted">Request a new reset link to continue.</p>
          </div>
        </div>
        <Link href="/reset-password" className="button">
          Request New Reset Link
        </Link>
        <Link href="/login" className="button secondary">
          Back to Sign In
        </Link>
      </section>
    );
  }

  return (
    <form className="surface-card stack" onSubmit={onSubmit} noValidate>
      <div className="section-heading">
        <div>
          <h1>Choose a New Password</h1>
        </div>
      </div>
      <label className="field">
        New Password
        <input
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isPending}
          required
        />
      </label>
      <button className="button" type="submit" disabled={isPending}>
        {isPending ? "Updating Password..." : "Update Password"}
      </button>
      <Link href="/login" className="button secondary">
        Back to Sign In
      </Link>
    </form>
  );
}
