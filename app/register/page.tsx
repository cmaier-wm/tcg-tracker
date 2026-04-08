import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import {
  getOptionalAuthenticatedUser,
  getValidatedReturnTo,
  resolvePostAuthRedirect
} from "@/lib/auth/auth-session";

export default async function RegisterPage({
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
      <RegisterForm returnTo={returnTo ?? null} />
      <section className="surface-card stack">
        <h2>Already have an account?</h2>
        <p className="muted">Sign in to continue managing your collection.</p>
        <Link
          href={returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : "/login"}
          className="button secondary"
        >
          Sign In
        </Link>
      </section>
    </div>
  );
}
