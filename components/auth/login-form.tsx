"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoadingLabel } from "@/components/ui/loading-label";

export function LoginForm({ returnTo }: { returnTo: string | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password, returnTo })
      });

      const payload = await response.json().catch(() => ({ error: "Unable to sign in." }));

      if (!response.ok) {
        toast.error(payload.error ?? "Unable to sign in.");
        return;
      }

      toast.success("Signed in");
      router.push(payload.returnTo ?? "/portfolio");
      router.refresh();
    });
  }

  return (
    <form className="surface-card stack" onSubmit={onSubmit}>
      <div className="section-heading">
        <div>
          <h1>Sign In</h1>
          <p className="muted">Use your email and password to access portfolio and settings.</p>
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
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isPending}
          required
        />
      </label>
      <Link href="/reset-password" className="button secondary">
        Forgot Password?
      </Link>
      <button className="button" type="submit" disabled={isPending}>
        <LoadingLabel isLoading={isPending} label="Sign In" loadingLabel="Signing in" />
      </button>
    </form>
  );
}
