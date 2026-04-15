import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import {
  getOptionalAuthenticatedUser,
  resolvePostAuthRedirect
} from "@/lib/auth/auth-session";
import { getPasswordResetTokenStatus } from "@/lib/auth/password-reset";

export default async function ResetPasswordTokenPage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const user = await getOptionalAuthenticatedUser();

  if (user) {
    redirect(resolvePostAuthRedirect(null));
  }

  const { token } = await params;
  const tokenStatus = await getPasswordResetTokenStatus(token);

  return (
    <div className="page-grid auth-page">
      <ResetPasswordForm
        token={token}
        initialErrorMessage={tokenStatus.state === "invalid" ? tokenStatus.message : null}
      />
    </div>
  );
}
