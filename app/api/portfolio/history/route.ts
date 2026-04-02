import { withRouteHandler } from "@/lib/api/route-handler";
import { getPortfolioHistory } from "@/lib/portfolio/get-portfolio-history";

export async function GET() {
  return withRouteHandler(async () => getPortfolioHistory());
}

