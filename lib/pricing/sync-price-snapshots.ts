import { prisma } from "@/lib/db/prisma";
import { getOptionalEnv } from "@/lib/db/env";
import { refreshCardCatalogMetrics } from "@/lib/tcgtracking/refresh-card-catalog-metrics";
import { tcgTrackingClient } from "@/lib/tcgtracking/client";
import {
  upstreamPricingSetSchema,
  upstreamSkuSetSchema
} from "@/lib/tcgtracking/schemas";

type SyncPriceSnapshotOptions = {
  categoryIds?: string[];
  limitSets?: number;
  staleAfterHours?: number;
};

type PricingProduct = {
  tcg?: Record<
    string,
    {
      low?: number | null;
      market?: number | null;
      high?: number | null;
    }
  > | null;
};

type SkuRecord = {
  cnd?: string | null;
  var?: string | null;
  lng?: string | null;
  mkt?: number | null;
  low?: number | null;
  hi?: number | null;
  cnt?: number | null;
};

function parseLimit(value: string | null) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function isFresh(updatedAt: Date, staleAfterHours: number) {
  return Date.now() - updatedAt.getTime() < staleAfterHours * 60 * 60 * 1000;
}

function normalizeFinish(value?: string | null) {
  if (!value) {
    return null;
  }

  const key = value.trim().toUpperCase();

  switch (key) {
    case "N":
      return "Normal";
    case "F":
      return "Foil";
    case "H":
      return "Holo";
    case "R":
      return "Reverse Holo";
    default:
      return value
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (character) => character.toUpperCase());
  }
}

function normalizeLanguageCode(value?: string | null) {
  return value ? value.toLowerCase() : null;
}

function languageLabel(value?: string | null) {
  if (!value) {
    return null;
  }

  const key = value.trim().toUpperCase();
  const labels: Record<string, string> = {
    EN: "English",
    JP: "Japanese",
    FR: "French",
    DE: "German",
    ES: "Spanish",
    IT: "Italian",
    PT: "Portuguese",
    RU: "Russian",
    KO: "Korean",
    CS: "Chinese",
    CT: "Chinese"
  };

  return labels[key] ?? key;
}

function toVariantLabel(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" / ") || "Default";
}

function parseCapturedAt(value?: string | null) {
  const parsed = value ? new Date(value) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

async function fetchSetPricing(categoryId: string, setId: string) {
  const payload = upstreamPricingSetSchema.parse(
    await tcgTrackingClient.fetchJson({
      path: `v1/${categoryId}/sets/${setId}/pricing`
    })
  );

  return {
    updatedAt: parseCapturedAt(payload.updated),
    prices: payload.prices ?? {}
  };
}

async function fetchSetSkus(categoryId: string, setId: string) {
  const payload = upstreamSkuSetSchema.parse(
    await tcgTrackingClient.fetchJson({
      path: `v1/${categoryId}/sets/${setId}/skus`
    })
  );

  return {
    updatedAt: parseCapturedAt(payload.updated),
    products: payload.products ?? {}
  };
}

async function upsertVariationSnapshot(input: {
  variationId: string;
  capturedAt: Date;
  marketPrice?: number | null;
  lowPrice?: number | null;
  highPrice?: number | null;
  listingCount?: number | null;
  sourceName: string;
}) {
  await prisma.priceSnapshot.upsert({
    where: {
      cardVariationId_sourceName_capturedAt: {
        cardVariationId: input.variationId,
        sourceName: input.sourceName,
        capturedAt: input.capturedAt
      }
    },
    update: {
      marketPrice: input.marketPrice ?? null,
      lowPrice: input.lowPrice ?? null,
      highPrice: input.highPrice ?? null,
      listingCount: input.listingCount ?? null
    },
    create: {
      cardVariationId: input.variationId,
      capturedAt: input.capturedAt,
      marketPrice: input.marketPrice ?? null,
      lowPrice: input.lowPrice ?? null,
      highPrice: input.highPrice ?? null,
      listingCount: input.listingCount ?? null,
      sourceName: input.sourceName
    }
  });
}

async function getOrCreateVariation(input: {
  cardId: string;
  sourceSkuId?: string | null;
  languageCode?: string | null;
  finish?: string | null;
  conditionCode?: string | null;
  variantLabel: string;
  isDefault?: boolean;
}) {
  if (input.sourceSkuId) {
    const existingBySource = await prisma.cardVariation.findUnique({
      where: {
        sourceSkuId: input.sourceSkuId
      }
    });

    if (existingBySource) {
      return prisma.cardVariation.update({
        where: {
          id: existingBySource.id
        },
        data: {
          languageCode: input.languageCode ?? null,
          finish: input.finish ?? null,
          conditionCode: input.conditionCode ?? null,
          variantLabel: input.variantLabel,
          isDefault: input.isDefault ?? existingBySource.isDefault
        }
      });
    }
  }

  const existing = await prisma.cardVariation.findFirst({
    where: {
      cardId: input.cardId,
      languageCode: input.languageCode ?? null,
      finish: input.finish ?? null,
      conditionCode: input.conditionCode ?? null,
      variantLabel: input.variantLabel
    }
  });

  if (existing) {
    return prisma.cardVariation.update({
      where: {
        id: existing.id
      },
      data: {
        sourceSkuId: input.sourceSkuId ?? existing.sourceSkuId,
        languageCode: input.languageCode ?? null,
        finish: input.finish ?? null,
        conditionCode: input.conditionCode ?? null,
        variantLabel: input.variantLabel,
        isDefault: input.isDefault ?? existing.isDefault
      }
    });
  }

  return prisma.cardVariation.create({
    data: {
      cardId: input.cardId,
      sourceSkuId: input.sourceSkuId ?? null,
      languageCode: input.languageCode ?? null,
      finish: input.finish ?? null,
      conditionCode: input.conditionCode ?? null,
      variantLabel: input.variantLabel,
      isDefault: input.isDefault ?? false
    }
  });
}

export async function syncPriceSnapshots(
  options: SyncPriceSnapshotOptions = {}
) {
  const selectedCategoryIds = new Set(options.categoryIds ?? []);
  const limitSets =
    options.limitSets ??
    parseLimit(getOptionalEnv("TCGTRACKING_PRICE_SET_LIMIT"));
  const staleAfterHours =
    options.staleAfterHours ??
    parseLimit(getOptionalEnv("TCGTRACKING_PRICE_STALE_HOURS")) ??
    24;

  const sets = (
    await prisma.cardSet.findMany({
      include: {
        category: true,
        cards: {
          include: {
            variations: {
              include: {
                priceSnapshots: {
                  orderBy: {
                    capturedAt: "desc"
                  },
                  take: 1
                }
              }
            }
          }
        }
      },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }]
    })
  )
    .filter((set) =>
      selectedCategoryIds.size ? selectedCategoryIds.has(set.category.sourceCategoryId) : true
    )
    .slice(0, limitSets);

  let syncedSnapshots = 0;
  let processedSets = 0;
  const refreshedSetIds = new Set<string>();

  for (const set of sets) {
    const latestLocalSnapshot = set.cards
      .flatMap((card) => card.variations.flatMap((variation) => variation.priceSnapshots))
      .sort((left, right) => right.capturedAt.getTime() - left.capturedAt.getTime())[0];

    if (latestLocalSnapshot && isFresh(latestLocalSnapshot.capturedAt, staleAfterHours)) {
      continue;
    }

    const [pricingPayload, skuPayload] = await Promise.all([
      fetchSetPricing(set.category.sourceCategoryId, set.sourceSetId),
      fetchSetSkus(set.category.sourceCategoryId, set.sourceSetId)
    ]);

    processedSets += 1;
    refreshedSetIds.add(set.id);

    const cardsBySourceProductId = new Map(
      set.cards.map((card) => [card.sourceProductId, card])
    );
    const productIds = new Set<string>([
      ...Object.keys(pricingPayload.prices),
      ...Object.keys(skuPayload.products)
    ]);

    for (const productId of productIds) {
      const card = cardsBySourceProductId.get(productId);

      if (!card) {
        continue;
      }

      const pricing = pricingPayload.prices[productId] as PricingProduct | undefined;
      const skus = skuPayload.products[productId] as Record<string, SkuRecord> | undefined;

      for (const [skuId, sku] of Object.entries(skus ?? {})) {
        const languageCode = normalizeLanguageCode(sku.lng);

        if (languageCode && languageCode !== "en") {
          continue;
        }

        const finish = normalizeFinish(sku.var);
        const conditionCode = sku.cnd ?? null;
        const variation = await getOrCreateVariation({
          cardId: card.id,
          sourceSkuId: skuId,
          languageCode,
          finish,
          conditionCode,
          variantLabel: toVariantLabel([
            languageLabel(sku.lng),
            finish,
            conditionCode
          ])
        });

        await upsertVariationSnapshot({
          variationId: variation.id,
          capturedAt: skuPayload.updatedAt,
          marketPrice: sku.mkt ?? null,
          lowPrice: sku.low ?? null,
          highPrice: sku.hi ?? null,
          listingCount: sku.cnt ?? null,
          sourceName: "tcgtracking-sku"
        });
        syncedSnapshots += 1;
      }

      for (const [subtype, price] of Object.entries(pricing?.tcg ?? {})) {
        const finish = normalizeFinish(subtype);
        const variation = await getOrCreateVariation({
          cardId: card.id,
          finish,
          variantLabel: toVariantLabel([finish]),
          isDefault: card.variations.length === 0
        });

        await upsertVariationSnapshot({
          variationId: variation.id,
          capturedAt: pricingPayload.updatedAt,
          marketPrice: price.market ?? null,
          lowPrice: price.low ?? null,
          highPrice: price.high ?? null,
          sourceName: "tcgtracking-product"
        });
        syncedSnapshots += 1;
      }
    }
  }

  if (refreshedSetIds.size) {
    await refreshCardCatalogMetrics({
      setIds: [...refreshedSetIds]
    });
  }

  return {
    sets: processedSets,
    snapshots: syncedSnapshots,
    capturedAt: new Date().toISOString()
  };
}
