import { getDemoCards } from "@/lib/db/demo-store";

export async function getCurrentPrice(variationId: string) {
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

