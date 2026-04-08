import { withRouteHandler } from "@/lib/api/route-handler";
import {
  getTeamsAlertSettings,
  upsertTeamsAlertSettings
} from "@/lib/teams/alert-preferences";
import { teamsAlertSettingsPayloadSchema } from "@/lib/teams/schemas";

export async function GET() {
  return withRouteHandler(async () => getTeamsAlertSettings());
}

export async function PUT(request: Request) {
  return withRouteHandler(async () => {
    const payload = teamsAlertSettingsPayloadSchema.parse(await request.json());
    return upsertTeamsAlertSettings(payload);
  });
}
