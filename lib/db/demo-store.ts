import { demoCards, demoPortfolio, demoPortfolioHistory } from "@/lib/db/demo-data";

type Holding = {
  id: string;
  cardVariationId: string;
  quantity: number;
};

type PortfolioPoint = {
  capturedAt: string;
  marketPrice: number;
};

declare global {
  var __demoStore:
    | {
        holdings: Holding[];
        portfolioHistory: PortfolioPoint[];
      }
    | undefined;
}

export function getDemoStore() {
  if (!global.__demoStore) {
    global.__demoStore = {
      holdings: [...demoPortfolio],
      portfolioHistory: [...demoPortfolioHistory]
    };
  }

  return global.__demoStore;
}

export function getDemoCards() {
  return demoCards;
}

export function resetDemoStore() {
  global.__demoStore = undefined;
}
