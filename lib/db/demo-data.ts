export type DemoPricePoint = {
  capturedAt: string;
  marketPrice: number;
};

export type DemoVariation = {
  id: string;
  label: string;
  languageCode?: string;
  finish?: string;
  conditionCode?: string;
  isDefault?: boolean;
  currentPrice?: number;
  lastUpdatedAt?: string;
  history: DemoPricePoint[];
};

export type DemoCard = {
  id: string;
  productType?: "card" | "sealed-product";
  category: string;
  categoryName: string;
  setName: string;
  name: string;
  collectorNumber?: string;
  rarity?: string;
  imageUrl?: string;
  variations: DemoVariation[];
};

export const demoCards: DemoCard[] = [
  {
    id: "sv1-charizard-ex",
    productType: "card",
    category: "pokemon",
    categoryName: "Pokemon",
    setName: "Scarlet & Violet",
    name: "Charizard ex",
    collectorNumber: "125/198",
    rarity: "Ultra Rare",
    imageUrl:
      "https://images.pokemontcg.io/sv1/125_hires.png",
    variations: [
      {
        id: "sv1-charizard-ex-en-nm-holo",
        label: "English / Holo / NM",
        languageCode: "en",
        finish: "Holo",
        conditionCode: "NM",
        currentPrice: 34.25,
        lastUpdatedAt: "2026-04-02T08:00:00.000Z",
        history: [
          { capturedAt: "2026-03-28T08:00:00.000Z", marketPrice: 31.1 },
          { capturedAt: "2026-03-29T08:00:00.000Z", marketPrice: 31.8 },
          { capturedAt: "2026-03-30T08:00:00.000Z", marketPrice: 33.2 },
          { capturedAt: "2026-03-31T08:00:00.000Z", marketPrice: 33.9 },
          { capturedAt: "2026-04-02T08:00:00.000Z", marketPrice: 34.25 }
        ]
      },
      {
        id: "sv1-charizard-ex-jp-nm-holo",
        label: "Japanese / Holo / NM",
        languageCode: "jp",
        finish: "Holo",
        conditionCode: "NM",
        currentPrice: 28.15,
        lastUpdatedAt: "2026-04-02T08:00:00.000Z",
        history: [
          { capturedAt: "2026-03-28T08:00:00.000Z", marketPrice: 26.7 },
          { capturedAt: "2026-03-29T08:00:00.000Z", marketPrice: 26.95 },
          { capturedAt: "2026-03-30T08:00:00.000Z", marketPrice: 27.6 },
          { capturedAt: "2026-04-02T08:00:00.000Z", marketPrice: 28.15 }
        ]
      }
    ]
  },
  {
    id: "lorcana-belle-strange",
    productType: "card",
    category: "lorcana",
    categoryName: "Disney Lorcana",
    setName: "Rise of the Floodborn",
    name: "Belle - Strange but Special",
    collectorNumber: "137/204",
    rarity: "Legendary",
    imageUrl:
      "https://tcgtracking.com/wp-content/uploads/woocommerce-placeholder.png",
    variations: [
      {
        id: "lorcana-belle-en-coldfoil",
        label: "English / Cold Foil / NM",
        languageCode: "en",
        finish: "Cold Foil",
        conditionCode: "NM",
        currentPrice: 18.4,
        lastUpdatedAt: "2026-04-02T08:00:00.000Z",
        history: [
          { capturedAt: "2026-03-28T08:00:00.000Z", marketPrice: 16.6 },
          { capturedAt: "2026-03-30T08:00:00.000Z", marketPrice: 17.4 },
          { capturedAt: "2026-04-02T08:00:00.000Z", marketPrice: 18.4 }
        ]
      }
    ]
  },
  {
    id: "onepiece-luffy-altart",
    productType: "card",
    category: "one-piece",
    categoryName: "One Piece",
    setName: "Romance Dawn",
    name: "Monkey.D.Luffy",
    collectorNumber: "OP01-024",
    rarity: "Alternate Art",
    imageUrl: undefined,
    variations: [
      {
        id: "onepiece-luffy-en-foil",
        label: "English / Foil / NM",
        languageCode: "en",
        finish: "Foil",
        conditionCode: "NM",
        currentPrice: 145.0,
        lastUpdatedAt: "2026-04-02T08:00:00.000Z",
        history: [
          { capturedAt: "2026-03-29T08:00:00.000Z", marketPrice: 142.75 },
          { capturedAt: "2026-03-31T08:00:00.000Z", marketPrice: 143.5 },
          { capturedAt: "2026-04-02T08:00:00.000Z", marketPrice: 145.0 }
        ]
      }
    ]
  },
  {
    id: "sv-base-booster-box",
    productType: "sealed-product",
    category: "pokemon",
    categoryName: "Pokemon",
    setName: "Scarlet & Violet",
    name: "Scarlet & Violet Booster Box",
    imageUrl: "https://tcgtracking.com/wp-content/uploads/woocommerce-placeholder.png",
    variations: [
      {
        id: "sv-base-booster-box-default",
        label: "Sealed",
        currentPrice: 119.99,
        lastUpdatedAt: "2026-04-02T08:00:00.000Z",
        history: [
          { capturedAt: "2026-03-28T08:00:00.000Z", marketPrice: 114.5 },
          { capturedAt: "2026-03-31T08:00:00.000Z", marketPrice: 117.0 },
          { capturedAt: "2026-04-02T08:00:00.000Z", marketPrice: 119.99 }
        ]
      }
    ]
  },
  {
    id: "sv-base-elite-trainer-box",
    productType: "sealed-product",
    category: "pokemon",
    categoryName: "Pokemon",
    setName: "Scarlet & Violet",
    name: "Scarlet & Violet Elite Trainer Box",
    imageUrl: "https://tcgtracking.com/wp-content/uploads/woocommerce-placeholder.png",
    variations: [
      {
        id: "sv-base-elite-trainer-box-default",
        label: "Sealed",
        currentPrice: 54.99,
        lastUpdatedAt: "2026-04-02T08:00:00.000Z",
        history: [
          { capturedAt: "2026-03-28T08:00:00.000Z", marketPrice: 49.5 },
          { capturedAt: "2026-03-31T08:00:00.000Z", marketPrice: 52.25 },
          { capturedAt: "2026-04-02T08:00:00.000Z", marketPrice: 54.99 }
        ]
      }
    ]
  }
];

export const demoPortfolio: Array<{
  id: string;
  cardVariationId: string;
  quantity: number;
}> = [];

export const demoPortfolioHistory: DemoPricePoint[] = [
  { capturedAt: "2026-03-28T08:00:00.000Z", marketPrice: 78.8 },
  { capturedAt: "2026-03-30T08:00:00.000Z", marketPrice: 81.1 },
  { capturedAt: "2026-04-02T08:00:00.000Z", marketPrice: 86.9 }
];
