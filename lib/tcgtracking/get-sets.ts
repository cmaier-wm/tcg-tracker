import { prisma } from "@/lib/db/prisma";
import { withDatabaseFallback } from "@/lib/db/runtime";
import { getDemoCards } from "@/lib/db/demo-store";

export type CatalogSet = {
  slug: string;
  name: string;
  categorySlug: string;
};

function toSetSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getCatalogSets(category?: string): Promise<CatalogSet[]> {
  return withDatabaseFallback(
    async () => {
      const sets = await prisma.cardSet.findMany({
        where: {
          category: category
            ? {
                slug: category
              }
            : undefined
        },
        include: {
          category: true
        },
        orderBy: [{ category: { name: "asc" } }, { name: "asc" }]
      });

      return sets.map((set) => ({
        slug: toSetSlug(set.name),
        name: set.name,
        categorySlug: set.category.slug
      }));
    },
    async () => {
      const deduped = new Map<string, CatalogSet>();

      for (const card of getDemoCards()) {
        if (category && card.category !== category) {
          continue;
        }

        deduped.set(`${card.category}:${card.setName}`, {
          slug: toSetSlug(card.setName),
          name: card.setName,
          categorySlug: card.category
        });
      }

      return [...deduped.values()].sort((left, right) =>
        left.name.localeCompare(right.name)
      );
    }
  );
}
