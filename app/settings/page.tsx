import React from "react";
import { getOptionalAuthenticatedUser } from "@/lib/auth/auth-session";
import { SettingsPage } from "@/components/settings/settings-page";
import { getAccountSettings } from "@/lib/settings/account-settings";

export default async function SettingsRoute() {
  const authenticatedUser = await getOptionalAuthenticatedUser();
  const { themeMode } = await getAccountSettings(authenticatedUser?.userId);

  return (
    <SettingsPage
      initialThemeMode={themeMode}
      isAuthenticated={Boolean(authenticatedUser)}
    />
  );
}
