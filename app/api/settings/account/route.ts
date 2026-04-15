import { withRouteHandler } from "@/lib/api/route-handler";
import { requireApiAuth } from "@/lib/auth/route-guards";
import {
  accountSettingsPayloadSchema,
  getAccountSettings,
  updateAccountSettings
} from "@/lib/settings/account-settings";

export async function GET() {
  return withRouteHandler(async () => {
    const user = await requireApiAuth();
    return getAccountSettings(user.userId);
  });
}

export async function PUT(request: Request) {
  return withRouteHandler(async () => {
    await requireApiAuth();
    const payload = accountSettingsPayloadSchema.parse(await request.json());
    return updateAccountSettings(payload);
  });
}
