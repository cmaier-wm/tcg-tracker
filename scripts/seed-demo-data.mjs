import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "DemoPass123!";

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

const demoUsers = [
  {
    id: "demo-user",
    email: "collector@local.tcg",
    displayName: "Collector",
    isLegacyDefault: true,
    themeMode: "dark",
    holdings: [],
    snapshots: []
  },
  {
    id: "demo-primary-user",
    email: "demo.primary@local.tcg",
    displayName: "Demo Primary",
    isLegacyDefault: false,
    themeMode: "dark",
    holdings: [
      {
        id: "demo-primary-charizard",
        cardVariationId: "sv1-charizard-ex-en-nm-holo",
        quantity: 2,
        notes: "High-interest demo holding",
        acquiredAt: "2026-04-10T15:00:00.000Z"
      },
      {
        id: "demo-primary-belle",
        cardVariationId: "lorcana-belle-en-coldfoil",
        quantity: 1,
        notes: "Secondary showcase holding",
        acquiredAt: "2026-04-11T15:00:00.000Z"
      }
    ],
    snapshots: [
      {
        capturedAt: "2026-04-12T08:00:00.000Z",
        totalValue: 72.2,
        holdingCount: 2,
        pricedHoldingCount: 2
      },
      {
        capturedAt: "2026-04-13T08:00:00.000Z",
        totalValue: 79.4,
        holdingCount: 2,
        pricedHoldingCount: 2
      },
      {
        capturedAt: "2026-04-14T08:00:00.000Z",
        totalValue: 86.9,
        holdingCount: 2,
        pricedHoldingCount: 2
      }
    ],
    teamsAlert: {
      id: "demo-primary-teams-pref",
      destinationLabel: "Demo Teams Channel",
      triggerAmountUsd: 1000,
      baselineValue: 72.2,
      lastEvaluatedAt: "2026-04-14T08:00:00.000Z",
      lastDeliveredAt: "2026-04-14T08:00:00.000Z"
    }
  },
  {
    id: "demo-empty-user",
    email: "demo.empty@local.tcg",
    displayName: "Demo Empty",
    isLegacyDefault: false,
    themeMode: "light",
    holdings: [],
    snapshots: []
  }
];

async function main() {
  await seedCards();
  await seedUsers();

  console.log("Seeded demo card data, accounts, holdings, and smoke-test fixtures into PostgreSQL.");
  console.log(`Demo credentials: demo.primary@local.tcg / ${DEMO_PASSWORD}`);
  console.log(`Demo credentials: demo.empty@local.tcg / ${DEMO_PASSWORD}`);
}

async function seedCards() {
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
}

async function seedUsers() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const encryptedWebhook = tryEncryptWebhookUrl("https://example.invalid/teams/demo-primary");

  for (const user of demoUsers) {
    await prisma.userAccount.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        displayName: user.displayName,
        isLegacyDefault: user.isLegacyDefault,
        legacyClaimedAt: null
      },
      create: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        isLegacyDefault: user.isLegacyDefault,
        legacyClaimedAt: null
      }
    });

    if (!user.isLegacyDefault) {
      await prisma.userCredential.upsert({
        where: { userId: user.id },
        update: {
          normalizedEmail: user.email.toLowerCase(),
          passwordHash
        },
        create: {
          userId: user.id,
          normalizedEmail: user.email.toLowerCase(),
          passwordHash
        }
      });
    }

    await prisma.accountSettings.upsert({
      where: { userId: user.id },
      update: {
        themeMode: user.themeMode
      },
      create: {
        userId: user.id,
        themeMode: user.themeMode
      }
    });

    for (const holding of user.holdings) {
      await prisma.portfolioHolding.upsert({
        where: {
          userId_cardVariationId: {
            userId: user.id,
            cardVariationId: holding.cardVariationId
          }
        },
        update: {
          quantity: holding.quantity,
          notes: holding.notes,
          acquiredAt: holding.acquiredAt ? new Date(holding.acquiredAt) : null
        },
        create: {
          id: holding.id,
          userId: user.id,
          cardVariationId: holding.cardVariationId,
          quantity: holding.quantity,
          notes: holding.notes,
          acquiredAt: holding.acquiredAt ? new Date(holding.acquiredAt) : null
        }
      });
    }

    for (const snapshot of user.snapshots) {
      await prisma.portfolioValuationSnapshot.upsert({
        where: {
          userId_capturedAt: {
            userId: user.id,
            capturedAt: new Date(snapshot.capturedAt)
          }
        },
        update: {
          totalValue: snapshot.totalValue,
          holdingCount: snapshot.holdingCount,
          pricedHoldingCount: snapshot.pricedHoldingCount
        },
        create: {
          userId: user.id,
          capturedAt: new Date(snapshot.capturedAt),
          totalValue: snapshot.totalValue,
          holdingCount: snapshot.holdingCount,
          pricedHoldingCount: snapshot.pricedHoldingCount
        }
      });
    }

    if (user.teamsAlert) {
      const enabled = Boolean(encryptedWebhook);

      await prisma.teamsAlertPreference.upsert({
        where: { userId: user.id },
        update: {
          enabled,
          destinationLabel: user.teamsAlert.destinationLabel,
          triggerAmountUsd: user.teamsAlert.triggerAmountUsd,
          encryptedWebhookUrl: encryptedWebhook?.encryptedWebhookUrl ?? null,
          webhookUrlIv: encryptedWebhook?.webhookUrlIv ?? null,
          baselineValue: user.teamsAlert.baselineValue,
          lastEvaluatedAt: new Date(user.teamsAlert.lastEvaluatedAt),
          lastDeliveredAt: enabled ? new Date(user.teamsAlert.lastDeliveredAt) : null,
          lastFailureAt: null,
          lastFailureMessage: null
        },
        create: {
          id: user.teamsAlert.id,
          userId: user.id,
          enabled,
          destinationLabel: user.teamsAlert.destinationLabel,
          triggerAmountUsd: user.teamsAlert.triggerAmountUsd,
          encryptedWebhookUrl: encryptedWebhook?.encryptedWebhookUrl ?? null,
          webhookUrlIv: encryptedWebhook?.webhookUrlIv ?? null,
          baselineValue: user.teamsAlert.baselineValue,
          lastEvaluatedAt: new Date(user.teamsAlert.lastEvaluatedAt),
          lastDeliveredAt: enabled ? new Date(user.teamsAlert.lastDeliveredAt) : null,
          lastFailureAt: null,
          lastFailureMessage: null
        }
      });

      if (enabled) {
        await prisma.teamsAlertDelivery.upsert({
          where: { id: "demo-primary-teams-delivery" },
          update: {
            userId: user.id,
            preferenceId: user.teamsAlert.id,
            capturedAt: new Date("2026-04-14T08:00:00.000Z"),
            portfolioValue: 86.9,
            baselineValue: 72.2,
            gainAmount: 14.7,
            status: "sent",
            failureMessage: null,
            responseCode: 202
          },
          create: {
            id: "demo-primary-teams-delivery",
            userId: user.id,
            preferenceId: user.teamsAlert.id,
            capturedAt: new Date("2026-04-14T08:00:00.000Z"),
            portfolioValue: 86.9,
            baselineValue: 72.2,
            gainAmount: 14.7,
            status: "sent",
            failureMessage: null,
            responseCode: 202
          }
        });
      }
    }
  }
}

function tryEncryptWebhookUrl(webhookUrl) {
  const secret = process.env.TEAMS_WEBHOOK_ENCRYPTION_KEY;

  if (!secret) {
    return null;
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    crypto.createHash("sha256").update(secret).digest(),
    iv
  );
  const encrypted = Buffer.concat([cipher.update(webhookUrl, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encryptedWebhookUrl: encrypted.toString("base64"),
    webhookUrlIv: Buffer.concat([iv, authTag]).toString("base64")
  };
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
