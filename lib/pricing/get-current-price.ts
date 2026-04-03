import { withDatabaseFallback } from "@/lib/db/runtime";
import { getDemoCards } from "@/lib/db/demo-store";
import { getDatabaseVariationHistory } from "@/lib/tcgtracking/db-catalog";

export async function getCurrentPrice(variationId: string) {
  return withDatabaseFallback(
    async () => {
      const latest = (await getDatabaseVariationHistory(variationId)).at(-1);
      return latest
        ? {
            currentPrice: latest.marketPrice ?? null,
            lastUpdatedAt: latest.capturedAt.toISOString()
          }
        : null;
    },
    async () => {
      const variation = getDemoCards()
        .flatMap((card) => card.variations)
        .find((item) => item.id === variationId);

      return (
        variation && {
          currentPrice: variation.currentPrice ?? null,
          lastUpdatedAt: variation.lastUpdatedAt ?? null
        }
      );
    }
  );
}
