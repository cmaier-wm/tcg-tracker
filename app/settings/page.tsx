import React from "react";
import { cookies } from "next/headers";
import { getOptionalAuthenticatedUser } from "@/lib/auth/auth-session";
import { SettingsPage } from "@/components/settings/settings-page";
import { normalizeThemeMode } from "@/lib/settings/theme-preference";
import { themeCookieName } from "@/lib/settings/theme-storage";

export default async function SettingsRoute() {
  const cookieStore = await cookies();
  const initialThemeMode = normalizeThemeMode(cookieStore.get(themeCookieName)?.value);
  const authenticatedUser = await getOptionalAuthenticatedUser();

  return (
    <SettingsPage
      initialThemeMode={initialThemeMode}
      isAuthenticated={Boolean(authenticatedUser)}
    />
  );
}
