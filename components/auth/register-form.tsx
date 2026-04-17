"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { registerRequestSchema } from "@/lib/auth/schemas";
import { LoadingLabel } from "@/components/ui/loading-label";

export function RegisterForm({ returnTo }: { returnTo: string | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = registerRequestSchema.safeParse({ email, password, returnTo });

    if (!parsed.success) {
      const nextError = parsed.error.issues[0]?.message ?? "Unable to register.";
      toast.error(nextError);
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password, returnTo })
      });

      const payload = await response.json().catch(() => ({ error: "Unable to register." }));

      if (!response.ok) {
        const nextError = payload.error ?? "Unable to register.";
        toast.error(nextError);
        return;
      }

      toast.success("Account created");
      router.push(payload.returnTo ?? "/portfolio");
      router.refresh();
    });
  }

  return (
    <form className="surface-card stack" onSubmit={onSubmit} noValidate>
      <div className="section-heading">
        <div>
          <h1>Create Account</h1>
          <p className="muted">Register with an email address and password to save your data.</p>
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
      <label className="field">
        Password
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
        <LoadingLabel
          isLoading={isPending}
          label="Create Account"
          loadingLabel="Creating account"
        />
      </button>
    </form>
  );
}
