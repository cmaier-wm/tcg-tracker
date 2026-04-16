import { holdingPayloadSchema } from "@/lib/tcgtracking/schemas";
import { withRouteHandler } from "@/lib/api/route-handler";
import { requireApiAuth } from "@/lib/auth/route-guards";
import { addHolding } from "@/lib/portfolio/add-holding";
import { getPortfolio } from "@/lib/portfolio/get-portfolio";

export async function GET(request: Request) {
  return withRouteHandler(async () => {
    await requireApiAuth();
    const url = new URL(request.url);
    return getPortfolio({
      page: url.searchParams.get("page"),
      sort: url.searchParams.get("sort")
    });
  });
}

export async function POST(request: Request) {
  return withRouteHandler(async () => {
    await requireApiAuth();
    const payload = holdingPayloadSchema.parse(await request.json());
    return addHolding(payload.cardVariationId, payload.quantity);
  });
}
