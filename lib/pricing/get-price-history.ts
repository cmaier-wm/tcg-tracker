import { notFound } from "@/lib/api/http-errors";
import { withDatabaseFallback } from "@/lib/db/runtime";
import { getDemoCards } from "@/lib/db/demo-store";
import { getDatabaseVariationHistory } from "@/lib/tcgtracking/db-catalog";

export async function getPriceHistory(variationId: string) {
  return withDatabaseFallback(
    async () => {
      const snapshots = await getDatabaseVariationHistory(variationId);

      return {
        variationId,
        points: snapshots
          .filter((snapshot) => snapshot.marketPrice != null)
          .map((snapshot) => ({
            capturedAt: snapshot.capturedAt.toISOString(),
            marketPrice: snapshot.marketPrice as number
          }))
      };
    },
    async () => {
      const variation = getDemoCards()
        .flatMap((card) => card.variations)
        .find((item) => item.id === variationId);

      if (!variation) {
        throw notFound("Card variation not found");
      }

      return {
        variationId,
        points: variation.history
      };
    }
  );
}
