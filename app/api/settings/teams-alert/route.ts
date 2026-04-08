import { withRouteHandler } from "@/lib/api/route-handler";
import { requireApiAuth } from "@/lib/auth/route-guards";
import {
  getTeamsAlertSettings,
  upsertTeamsAlertSettings
} from "@/lib/teams/alert-preferences";
import { teamsAlertSettingsPayloadSchema } from "@/lib/teams/schemas";

export async function GET() {
  return withRouteHandler(async () => {
    await requireApiAuth();
    return getTeamsAlertSettings();
  });
}

export async function PUT(request: Request) {
  return withRouteHandler(async () => {
    await requireApiAuth();
    const payload = teamsAlertSettingsPayloadSchema.parse(await request.json());
    return upsertTeamsAlertSettings(payload);
  });
}
