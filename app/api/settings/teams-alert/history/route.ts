import { z } from "zod";
import { withRouteHandler } from "@/lib/api/route-handler";
import { getTeamsAlertDeliveryHistory } from "@/lib/teams/alert-preferences";

const historyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(25).default(5)
});

export async function GET(request: Request) {
  return withRouteHandler(async () => {
    const url = new URL(request.url);
    const query = historyQuerySchema.parse({
      page: url.searchParams.get("page") ?? undefined,
      pageSize: url.searchParams.get("pageSize") ?? undefined
    });

    return getTeamsAlertDeliveryHistory(query);
  });
}
