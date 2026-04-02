import { withRouteHandler } from "@/lib/api/route-handler";
import { saveValuationSnapshot } from "@/lib/portfolio/save-valuation-snapshot";
import { syncPriceSnapshots } from "@/lib/pricing/sync-price-snapshots";
import { syncCatalog } from "@/lib/tcgtracking/sync-catalog";

export async function POST() {
  return withRouteHandler(async () => {
    const [catalog, pricing, portfolio] = await Promise.all([
      syncCatalog(),
      syncPriceSnapshots(),
      saveValuationSnapshot()
    ]);

    return { catalog, pricing, portfolio };
  });
}

