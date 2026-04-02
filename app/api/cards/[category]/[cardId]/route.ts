import { withRouteHandler } from "@/lib/api/route-handler";
import { getCardDetail } from "@/lib/tcgtracking/get-card-detail";

export async function GET(
  _request: Request,
  context: { params: Promise<{ category: string; cardId: string }> }
) {
  const params = await context.params;

  return withRouteHandler(async () => getCardDetail(params.category, params.cardId));
}

