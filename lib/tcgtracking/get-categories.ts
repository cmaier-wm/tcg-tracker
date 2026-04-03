import { prisma } from "@/lib/db/prisma";
import { withDatabaseFallback } from "@/lib/db/runtime";
import { getDemoCards } from "@/lib/db/demo-store";

export type CatalogCategory = {
  slug: string;
  name: string;
};

export async function getCatalogCategories(): Promise<CatalogCategory[]> {
  return withDatabaseFallback(
    async () => {
      const categories = await prisma.cardCategory.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" }
      });

      return categories.map((category) => ({
        slug: category.slug,
        name: category.name
      }));
    },
    async () => {
      const deduped = new Map<string, CatalogCategory>();

      for (const card of getDemoCards()) {
        deduped.set(card.category, {
          slug: card.category,
          name: card.categoryName
        });
      }

      return [...deduped.values()].sort((left, right) =>
        left.name.localeCompare(right.name)
      );
    }
  );
}

