import React from "react";
import { getOptionalAuthenticatedUser } from "@/lib/auth/auth-session";
import { SettingsPage } from "@/components/settings/settings-page";
import { getAccountThemeMode } from "@/lib/teams/alert-preferences";

export default async function SettingsRoute() {
  const authenticatedUser = await getOptionalAuthenticatedUser();
  const initialThemeMode = await getAccountThemeMode(authenticatedUser?.userId);

  return (
    <SettingsPage
      initialThemeMode={initialThemeMode}
      isAuthenticated={Boolean(authenticatedUser)}
    />
  );
}
