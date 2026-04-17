import { notFound } from "@/lib/api/http-errors";
import { withDatabaseFallback } from "@/lib/db/runtime";
import { getDemoCards } from "@/lib/db/demo-store";
import { isCodeCard } from "@/lib/tcgtracking/code-card";
import { getDatabaseCardDetail } from "@/lib/tcgtracking/db-catalog";

export async function getCardDetail(category: string, cardId: string) {
  return withDatabaseFallback(
    async () => {
      const card = await getDatabaseCardDetail(category, cardId);

      if (!card) {
        throw notFound("Card not found");
      }

      if (isCodeCard(card)) {
        throw notFound("Card not found");
      }

      return {
        id: card.id,
        category: card.set.category.slug,
        categoryName: card.set.category.name,
        setName: card.set.name,
        name: card.name,
        collectorNumber: card.collectorNumber,
        rarity: card.rarity,
        imageUrl: card.imageUrl,
        variations: card.variations.map((variation) => ({
          id: variation.id,
          label: variation.variantLabel,
          languageCode: variation.languageCode,
          finish: variation.finish,
          conditionCode: variation.conditionCode,
          isDefault: variation.isDefault,
          currentPrice: variation.priceSnapshots[0]?.marketPrice ?? null,
          lastUpdatedAt: variation.priceSnapshots[0]?.capturedAt.toISOString() ?? null
        }))
      };
    },
    async () => {
      const card = getDemoCards().find(
        (item) => item.category === category && item.id === cardId
      );

      if (!card) {
        throw notFound("Card not found");
      }

      if (isCodeCard(card)) {
        throw notFound("Card not found");
      }

      return {
        id: card.id,
        category: card.category,
        categoryName: card.categoryName,
        setName: card.setName,
        name: card.name,
        collectorNumber: card.collectorNumber ?? null,
        rarity: card.rarity ?? null,
        imageUrl: card.imageUrl ?? null,
        variations: card.variations.map((variation) => ({
          id: variation.id,
          label: variation.label,
          languageCode: variation.languageCode ?? null,
          finish: variation.finish ?? null,
          conditionCode: variation.conditionCode ?? null,
          isDefault: variation.isDefault ?? false,
          currentPrice: variation.currentPrice ?? null,
          lastUpdatedAt: variation.lastUpdatedAt ?? null
        }))
      };
    }
  );
}
