import { requireAuthenticatedUser } from "@/lib/auth/auth-session";
import type { MobileSessionResponse } from "@/lib/mobile/types";

export async function getMobileSession(): Promise<MobileSessionResponse> {
  const user = await requireAuthenticatedUser();

  return {
    status: "authenticated",
    user
  };
}
