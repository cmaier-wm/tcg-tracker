import { withRouteHandler } from "@/lib/api/route-handler";
import { requireApiAuth } from "@/lib/auth/route-guards";
import { getPortfolioHistory } from "@/lib/portfolio/get-portfolio-history";

export async function GET() {
  return withRouteHandler(async () => {
    await requireApiAuth();
    return getPortfolioHistory();
  });
}
