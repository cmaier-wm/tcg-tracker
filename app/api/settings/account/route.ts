import { withRouteHandler } from "@/lib/api/route-handler";
import { getOptionalAuthenticatedUser } from "@/lib/auth/auth-session";
import {
  accountSettingsPayloadSchema,
  getAccountSettings,
  updateAccountSettings
} from "@/lib/settings/account-settings";
import { setThemeModeCookie } from "@/lib/settings/theme-cookie";

export async function GET() {
  return withRouteHandler(async () => {
    const user = await getOptionalAuthenticatedUser();
    return getAccountSettings(user?.userId);
  });
}

export async function PUT(request: Request) {
  return withRouteHandler(async () => {
    const user = await getOptionalAuthenticatedUser();
    const payload = accountSettingsPayloadSchema.parse(await request.json());

    if (user) {
      return updateAccountSettings(payload);
    }

    await setThemeModeCookie(payload.themeMode);
    return { themeMode: payload.themeMode };
  });
}
