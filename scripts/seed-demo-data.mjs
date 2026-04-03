import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const cards = [
  {
    id: "sv1-charizard-ex",
    category: { id: "pokemon", sourceCategoryId: "pokemon", name: "Pokemon", slug: "pokemon" },
    set: {
      id: "sv1",
      sourceSetId: "sv1",
      name: "Scarlet & Violet",
      abbreviation: "SV1"
    },
    card: {
      sourceProductId: "sv1-charizard-ex",
      name: "Charizard ex",
      cleanName: "charizard ex",
      collectorNumber: "125/198",
      rarity: "Ultra Rare",
      imageUrl: "https://images.pokemontcg.io/sv1/125_hires.png"
    },
    variations: [
      {
        id: "sv1-charizard-ex-en-nm-holo",
        sourceSkuId: "sv1-charizard-ex-en-nm-holo",
        languageCode: "en",
        finish: "Holo",
        conditionCode: "NM",
        variantLabel: "English / Holo / NM",
        isDefault: true,
        history: [31.1, 31.8, 33.2, 33.9, 34.25]
      },
      {
        id: "sv1-charizard-ex-jp-nm-holo",
        sourceSkuId: "sv1-charizard-ex-jp-nm-holo",
        languageCode: "jp",
        finish: "Holo",
        conditionCode: "NM",
        variantLabel: "Japanese / Holo / NM",
        isDefault: false,
        history: [26.7, 26.95, 27.6, 28.15]
      }
    ]
  },
  {
    id: "lorcana-belle-strange",
    category: { id: "lorcana", sourceCategoryId: "lorcana", name: "Disney Lorcana", slug: "lorcana" },
    set: {
      id: "floodborn",
      sourceSetId: "floodborn",
      name: "Rise of the Floodborn",
      abbreviation: "Floodborn"
    },
    card: {
      sourceProductId: "lorcana-belle-strange",
      name: "Belle - Strange but Special",
      cleanName: "belle strange but special",
      collectorNumber: "137/204",
      rarity: "Legendary",
      imageUrl: "https://tcgtracking.com/wp-content/uploads/woocommerce-placeholder.png"
    },
    variations: [
      {
        id: "lorcana-belle-en-coldfoil",
        sourceSkuId: "lorcana-belle-en-coldfoil",
        languageCode: "en",
        finish: "Cold Foil",
        conditionCode: "NM",
        variantLabel: "English / Cold Foil / NM",
        isDefault: true,
        history: [16.6, 17.4, 18.4]
      }
    ]
  }
];

for (const entry of cards) {
  await prisma.cardCategory.upsert({
    where: { id: entry.category.id },
    update: {
      name: entry.category.name,
      slug: entry.category.slug,
      sourceCategoryId: entry.category.sourceCategoryId
    },
    create: entry.category
  });

  await prisma.cardSet.upsert({
    where: { id: entry.set.id },
    update: {
      categoryId: entry.category.id,
      name: entry.set.name,
      abbreviation: entry.set.abbreviation,
      sourceSetId: entry.set.sourceSetId
    },
    create: {
      ...entry.set,
      categoryId: entry.category.id
    }
  });

  await prisma.card.upsert({
    where: { id: entry.id },
    update: {
      setId: entry.set.id,
      ...entry.card
    },
    create: {
      id: entry.id,
      setId: entry.set.id,
      ...entry.card
    }
  });

  for (const variation of entry.variations) {
    await prisma.cardVariation.upsert({
      where: { id: variation.id },
      update: {
        cardId: entry.id,
        sourceSkuId: variation.sourceSkuId,
        languageCode: variation.languageCode,
        finish: variation.finish,
        conditionCode: variation.conditionCode,
        variantLabel: variation.variantLabel,
        isDefault: variation.isDefault
      },
      create: {
        id: variation.id,
        cardId: entry.id,
        sourceSkuId: variation.sourceSkuId,
        languageCode: variation.languageCode,
        finish: variation.finish,
        conditionCode: variation.conditionCode,
        variantLabel: variation.variantLabel,
        isDefault: variation.isDefault
      }
    });

    for (const [index, price] of variation.history.entries()) {
      const capturedAt = new Date(Date.UTC(2026, 2, 28 + index, 8, 0, 0));
      await prisma.priceSnapshot.upsert({
        where: {
          cardVariationId_sourceName_capturedAt: {
            cardVariationId: variation.id,
            sourceName: "seed",
            capturedAt
          }
        },
        update: {
          marketPrice: price
        },
        create: {
          cardVariationId: variation.id,
          capturedAt,
          marketPrice: price,
          sourceName: "seed"
        }
      });
    }
  }
}

await prisma.userAccount.upsert({
  where: { id: "demo-user" },
  update: {},
  create: {
    id: "demo-user",
    email: "collector@local.tcg",
    displayName: "Collector"
  }
});

console.log("Seeded demo card data into PostgreSQL.");
await prisma.$disconnect();

