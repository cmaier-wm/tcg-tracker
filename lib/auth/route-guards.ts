import { redirect } from "next/navigation";
import { unauthorized } from "@/lib/api/http-errors";
import {
  getOptionalAuthenticatedUser,
  getValidatedReturnTo
} from "@/lib/auth/auth-session";

export async function requirePageAuth(returnTo?: string) {
  const user = await getOptionalAuthenticatedUser();

  if (user) {
    return user;
  }

  const validatedReturnTo = getValidatedReturnTo(returnTo);
  redirect(validatedReturnTo ? `/login?returnTo=${encodeURIComponent(validatedReturnTo)}` : "/login");
}

export async function requireApiAuth() {
  const user = await getOptionalAuthenticatedUser();

  if (!user) {
    throw unauthorized("Authentication is required.");
  }

  return user;
}
