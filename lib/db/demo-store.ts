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

export type DemoTeamsAlertPreference = {
  id: string;
  enabled: boolean;
  destinationLabel: string | null;
  triggerAmountUsd: number;
  encryptedWebhookUrl: string | null;
  webhookUrlIv: string | null;
  baselineValue: number | null;
  lastEvaluatedAt: string | null;
  lastDeliveredAt: string | null;
  lastFailureAt: string | null;
  lastFailureMessage: string | null;
};

export type DemoTeamsAlertDelivery = {
  id: string;
  userId: string;
  preferenceId: string;
  capturedAt: string;
  portfolioValue: number;
  baselineValue: number;
  gainAmount: number;
  status: string;
  failureMessage: string | null;
  responseCode: number | null;
  createdAt: string;
};

declare global {
  var __demoStore:
    | {
        holdings: Holding[];
        portfolioHistory: PortfolioPoint[];
        teamsAlertPreference: DemoTeamsAlertPreference | null;
        teamsAlertDeliveries: DemoTeamsAlertDelivery[];
      }
    | undefined;
}

export function getDemoStore() {
  if (!global.__demoStore) {
    global.__demoStore = {
      holdings: [...demoPortfolio],
      portfolioHistory: [...demoPortfolioHistory],
      teamsAlertPreference: null,
      teamsAlertDeliveries: []
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
