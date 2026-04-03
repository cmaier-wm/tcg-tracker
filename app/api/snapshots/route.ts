import { withRouteHandler } from "@/lib/api/route-handler";
import { saveValuationSnapshot } from "@/lib/portfolio/save-valuation-snapshot";
import { syncPriceSnapshots } from "@/lib/pricing/sync-price-snapshots";
import { syncCatalog } from "@/lib/tcgtracking/sync-catalog";

export async function POST(request: Request) {
  const searchParams = new URL(request.url).searchParams;

  return withRouteHandler(async () => {
    const catalogOnly = searchParams.get("catalogOnly") === "true";
    const pricingOnly = searchParams.get("pricingOnly") === "true";
    const categoryIds = searchParams.getAll("categoryId");

    if (pricingOnly) {
      const [pricing, portfolio] = await Promise.all([
        syncPriceSnapshots({
          categoryIds: categoryIds.length ? categoryIds : undefined
        }),
        saveValuationSnapshot()
      ]);

      return { pricing, portfolio };
    }

    const catalog = await syncCatalog({
      categoryIds: categoryIds.length ? categoryIds : undefined
    });

    if (catalogOnly) {
      return { catalog };
    }

    const [pricing, portfolio] = await Promise.all([
      syncPriceSnapshots({
        categoryIds: categoryIds.length ? categoryIds : undefined
      }),
      saveValuationSnapshot()
    ]);

    return { catalog, pricing, portfolio };
  });
}
