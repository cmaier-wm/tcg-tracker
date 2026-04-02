import { badRequest } from "@/lib/api/http-errors";
import { withRouteHandler } from "@/lib/api/route-handler";
import { getPriceHistory } from "@/lib/pricing/get-price-history";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const variationId = searchParams.get("variationId");

  return withRouteHandler(async () => {
    if (!variationId) {
      throw badRequest("variationId is required");
    }

    return getPriceHistory(variationId);
  });
}

