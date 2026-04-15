import { prisma } from "@/lib/db/prisma";
import { getOptionalEnv } from "@/lib/db/env";
import { refreshCardCatalogMetrics } from "@/lib/tcgtracking/refresh-card-catalog-metrics";
import { tcgTrackingClient } from "@/lib/tcgtracking/client";
import {
  upstreamCardSchema,
  upstreamCategorySchema,
  upstreamSetSchema
} from "@/lib/tcgtracking/schemas";

type UpstreamCategory = {
  id: string;
  name: string;
  products?: number | null;
  sets?: number | null;
};

type UpstreamSet = {
  id: string;
  category_id?: string;
  name: string;
  abbreviation?: string | null;
  release_date?: string | null;
};

type UpstreamCard = {
  id: string;
  set_id?: string;
  category_id?: string;
  name: string;
  clean_name?: string | null;
  set_name?: string | null;
  set_abbr?: string | null;
  number?: string | null;
  collector_number?: string | null;
  rarity?: string | null;
  image_url?: string | null;
  tcgplayer_url?: string | null;
  finishes?: string[] | null;
  cardtrader?: Array<{
    finishes?: string[] | null;
    languages?: string[] | null;
    properties?: Array<{
      name: string;
      default_value?: string | boolean | null;
      possible_values?: Array<string | boolean> | null;
    }> | null;
  }> | null;
};

type SyncCatalogOptions = {
  categoryIds?: string[];
  limitCategories?: number;
  limitSetsPerCategory?: number;
  staleAfterDays?: number;
};

type SyncSummary = {
  categories: number;
  sets: number;
  cards: number;
  variations: number;
  syncedAt: string;
};

function parseLimit(value: string | null) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function isStale(updatedAt: Date, staleAfterDays: number) {
  return Date.now() - updatedAt.getTime() >= staleAfterDays * 24 * 60 * 60 * 1000;
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeFinish(value?: string | null) {
  if (!value) {
    return null;
  }

  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function toVariantLabel(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" / ");
}

function getLanguagesFromCard(card: UpstreamCard) {
  const languages = new Set<string>();

  for (const blueprint of card.cardtrader ?? []) {
    for (const language of blueprint.languages ?? []) {
      if (language.toUpperCase() === "EN") {
        languages.add("EN");
      }
    }

    for (const property of blueprint.properties ?? []) {
      if (!property.name.includes("language")) {
        continue;
      }

      for (const value of property.possible_values ?? []) {
        if (typeof value === "string" && value.toUpperCase() === "EN") {
          languages.add("EN");
        }
      }

      if (
        typeof property.default_value === "string" &&
        property.default_value.toUpperCase() === "EN"
      ) {
        languages.add("EN");
      }
    }
  }

  return [...languages];
}

function buildDefaultVariations(card: UpstreamCard) {
  const finishes = new Set<string>();

  for (const finish of card.finishes ?? []) {
    finishes.add(finish);
  }

  for (const blueprint of card.cardtrader ?? []) {
    for (const finish of blueprint.finishes ?? []) {
      finishes.add(finish);
    }

    for (const property of blueprint.properties ?? []) {
      if (!property.name.includes("foil") && !property.name.includes("finish")) {
        continue;
      }

      for (const value of property.possible_values ?? []) {
        if (typeof value === "string") {
          finishes.add(value);
        } else if (value === true) {
          finishes.add("foil");
        } else if (value === false) {
          finishes.add("normal");
        }
      }
    }
  }

  const normalizedFinishes = [...finishes]
    .map((finish) => normalizeFinish(finish))
    .filter((finish): finish is string => Boolean(finish));
  const languages = getLanguagesFromCard(card);

  if (!normalizedFinishes.length && !languages.length) {
    return [
      {
        sourceSkuId: null,
        languageCode: null,
        finish: null,
        conditionCode: null,
        variantLabel: "Default",
        isDefault: true
      }
    ];
  }

  if (!normalizedFinishes.length) {
    return languages.map((language, index) => ({
      sourceSkuId: null,
      languageCode: language,
      finish: null,
      conditionCode: null,
      variantLabel: toVariantLabel([language]),
      isDefault: index === 0
    }));
  }

  const finishesToUse = normalizedFinishes.length ? normalizedFinishes : [null];
  const languagesToUse = languages.length ? languages : [null];

  return languagesToUse.flatMap((language, languageIndex) =>
    finishesToUse.map((finish, finishIndex) => ({
      sourceSkuId: null,
      languageCode: language,
      finish,
      conditionCode: null,
      variantLabel: toVariantLabel([language, finish]) || "Default",
      isDefault: languageIndex === 0 && finishIndex === 0
    }))
  );
}

async function fetchCategories() {
  const payload = await tcgTrackingClient.fetchJson<{
    categories?: unknown[];
  }>({
    path: "v1/categories"
  });

  const categories = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.categories)
      ? payload.categories
      : [];

  return categories.map((category) => upstreamCategorySchema.parse(category)) as UpstreamCategory[];
}

async function fetchSets(categoryId: string) {
  const payload = await tcgTrackingClient.fetchJson<{
    sets?: unknown[];
  }>({
    path: `v1/${categoryId}/sets`
  });

  const sets = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.sets)
      ? payload.sets
      : [];

  return sets.map((set) => upstreamSetSchema.parse(set)) as UpstreamSet[];
}

async function fetchCards(categoryId: string, setId: string) {
  const payload = await tcgTrackingClient.fetchJson<{
    products?: unknown[];
  }>({
    path: `v1/${categoryId}/sets/${setId}`
  });

  const cards = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.products)
      ? payload.products
      : [];

  return cards.map((card) => upstreamCardSchema.parse(card)) as UpstreamCard[];
}

async function getOrCreateCategory(input: { sourceCategoryId: string; name: string; slug: string }) {
  const existing =
    (await prisma.cardCategory.findUnique({
      where: {
        sourceCategoryId: input.sourceCategoryId
      }
    })) ??
    (await prisma.cardCategory.findUnique({
      where: {
        slug: input.slug
      }
    }));

  if (existing) {
    return prisma.cardCategory.update({
      where: {
        id: existing.id
      },
      data: {
        sourceCategoryId: input.sourceCategoryId,
        name: input.name,
        slug: input.slug,
        isActive: true
      }
    });
  }

  return prisma.cardCategory.create({
    data: {
      sourceCategoryId: input.sourceCategoryId,
      name: input.name,
      slug: input.slug,
      isActive: true
    }
  });
}

async function syncCardVariations(cardId: string, card: UpstreamCard) {
  const variations = buildDefaultVariations(card);

  for (const variation of variations) {
    const existing = await prisma.cardVariation.findFirst({
      where: {
        cardId,
        languageCode: variation.languageCode,
        finish: variation.finish,
        conditionCode: variation.conditionCode,
        variantLabel: variation.variantLabel
      }
    });

    if (existing) {
      await prisma.cardVariation.update({
        where: {
          id: existing.id
        },
        data: {
          sourceSkuId: variation.sourceSkuId,
          languageCode: variation.languageCode,
          finish: variation.finish,
          conditionCode: variation.conditionCode,
          variantLabel: variation.variantLabel,
          isDefault: variation.isDefault
        }
      });
    } else {
      await prisma.cardVariation.create({
        data: {
          cardId,
          sourceSkuId: variation.sourceSkuId,
          languageCode: variation.languageCode,
          finish: variation.finish,
          conditionCode: variation.conditionCode,
          variantLabel: variation.variantLabel,
          isDefault: variation.isDefault
        }
      });
    }
  }

  return variations.length;
}

export async function syncCatalog(
  options: SyncCatalogOptions = {}
): Promise<SyncSummary> {
  const selectedCategoryIds = new Set(options.categoryIds ?? []);
  const limitCategories =
    options.limitCategories ??
    parseLimit(getOptionalEnv("TCGTRACKING_SYNC_CATEGORY_LIMIT"));
  const limitSetsPerCategory =
    options.limitSetsPerCategory ??
    parseLimit(getOptionalEnv("TCGTRACKING_SYNC_SET_LIMIT"));
  const staleAfterDays =
    options.staleAfterDays ??
    parseLimit(getOptionalEnv("TCGTRACKING_STATIC_STALE_DAYS")) ??
    7;

  const upstreamCategories = await fetchCategories();
  const categories = upstreamCategories
    .filter((category) =>
      selectedCategoryIds.size ? selectedCategoryIds.has(category.id) : true
    )
    .slice(0, limitCategories);

  let syncedSetCount = 0;
  let syncedCardCount = 0;
  let syncedVariationCount = 0;
  const refreshedSetIds = new Set<string>();

  for (const category of categories) {
    const categorySlug = toSlug(category.name);
    const categoryRecord = await getOrCreateCategory({
      sourceCategoryId: category.id,
      name: category.name,
      slug: categorySlug
    });

    const sets = (await fetchSets(category.id)).slice(0, limitSetsPerCategory);
    syncedSetCount += sets.length;

    for (const set of sets) {
      const existingSet = await prisma.cardSet.findUnique({
        where: {
          sourceSetId: set.id
        },
        select: {
          id: true,
          updatedAt: true
        }
      });

      if (!existingSet) {
        await prisma.cardSet.create({
          data: {
            categoryId: categoryRecord.id,
            sourceSetId: set.id,
            name: set.name,
            abbreviation: set.abbreviation ?? null,
            releasedOn: parseDate(set.release_date)
          }
        });
      } else if (isStale(existingSet.updatedAt, staleAfterDays)) {
        await prisma.cardSet.update({
          where: {
            id: existingSet.id
          },
          data: {
            categoryId: categoryRecord.id,
            name: set.name,
            abbreviation: set.abbreviation ?? null,
            releasedOn: parseDate(set.release_date)
          }
        });
      }

      const setRecord = existingSet
        ? {
            id: existingSet.id,
            updatedAt: existingSet.updatedAt
          }
        : await prisma.cardSet.findUniqueOrThrow({
            where: {
              sourceSetId: set.id
            },
            select: {
              id: true,
              updatedAt: true
            }
          });

      if (existingSet && !isStale(existingSet.updatedAt, staleAfterDays)) {
        continue;
      }

      const cards = await fetchCards(category.id, set.id);
      syncedCardCount += cards.length;

      for (const card of cards) {
        const cardRecord = await prisma.card.upsert({
          where: {
            sourceProductId: card.id
          },
          update: {
            setId: setRecord.id,
            name: card.name,
            cleanName: card.clean_name ?? card.name.toLowerCase(),
            collectorNumber: card.collector_number ?? card.number ?? null,
            rarity: card.rarity ?? null,
            imageUrl: card.image_url ?? null,
            externalProductUrl: card.tcgplayer_url ?? null
          },
          create: {
            setId: setRecord.id,
            sourceProductId: card.id,
            name: card.name,
            cleanName: card.clean_name ?? card.name.toLowerCase(),
            collectorNumber: card.collector_number ?? card.number ?? null,
            rarity: card.rarity ?? null,
            imageUrl: card.image_url ?? null,
            externalProductUrl: card.tcgplayer_url ?? null
          }
        });

        syncedVariationCount += await syncCardVariations(cardRecord.id, card);
      }

      refreshedSetIds.add(setRecord.id);
    }
  }

  if (refreshedSetIds.size) {
    await refreshCardCatalogMetrics({
      setIds: [...refreshedSetIds]
    });
  }

  return {
    categories: categories.length,
    sets: syncedSetCount,
    cards: syncedCardCount,
    variations: syncedVariationCount,
    syncedAt: new Date().toISOString()
  };
}
