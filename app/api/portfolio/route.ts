import { holdingPayloadSchema } from "@/lib/tcgtracking/schemas";
import { withRouteHandler } from "@/lib/api/route-handler";
import { addHolding } from "@/lib/portfolio/add-holding";
import { getPortfolio } from "@/lib/portfolio/get-portfolio";

export async function GET() {
  return withRouteHandler(async () => getPortfolio());
}

export async function POST(request: Request) {
  return withRouteHandler(async () => {
    const payload = holdingPayloadSchema.parse(await request.json());
    return addHolding(payload.cardVariationId, payload.quantity);
  });
}

