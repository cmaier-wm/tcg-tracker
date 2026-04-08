import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import {
  getOptionalAuthenticatedUser,
  getValidatedReturnTo,
  resolvePostAuthRedirect
} from "@/lib/auth/auth-session";

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Promise<{ returnTo?: string }>;
}) {
  const user = await getOptionalAuthenticatedUser();
  const resolvedSearchParams = (await searchParams) ?? {};
  const returnTo = getValidatedReturnTo(resolvedSearchParams.returnTo);

  if (user) {
    redirect(returnTo ?? resolvePostAuthRedirect(null));
  }

  return (
    <div className="page-grid auth-page">
      <LoginForm returnTo={returnTo ?? null} />
      <section className="surface-card stack">
        <h2>New here?</h2>
        <p className="muted">Create an account to keep portfolio and Teams settings private to you.</p>
        <Link
          href={returnTo ? `/register?returnTo=${encodeURIComponent(returnTo)}` : "/register"}
          className="button secondary"
        >
          Create Account
        </Link>
      </section>
    </div>
  );
}
