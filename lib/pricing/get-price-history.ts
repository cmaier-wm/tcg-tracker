import { notFound } from "@/lib/api/http-errors";
import { getDemoCards } from "@/lib/db/demo-store";

export async function getPriceHistory(variationId: string) {
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

