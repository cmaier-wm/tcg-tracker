import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import {
  getOptionalAuthenticatedUser,
  resolvePostAuthRedirect
} from "@/lib/auth/auth-session";

export default async function ResetPasswordPage() {
  const user = await getOptionalAuthenticatedUser();

  if (user) {
    redirect(resolvePostAuthRedirect(null));
  }

  return (
    <div className="page-grid auth-page">
      <ForgotPasswordForm />
    </div>
  );
}
