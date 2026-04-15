import { demoCards, demoPortfolio, demoPortfolioHistory } from "@/lib/db/demo-data";

type Holding = {
  id: string;
  cardVariationId: string;
  quantity: number;
  createdAt?: string;
};

type PortfolioPoint = {
  capturedAt: string;
  marketPrice: number;
};

export type DemoTeamsAlertPreference = {
  id: string;
  themeMode: "light" | "dark";
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

export type DemoUserAccount = {
  id: string;
  email: string;
  displayName: string;
  isLegacyDefault: boolean;
  legacyClaimedAt: string | null;
};

export type DemoUserCredential = {
  userId: string;
  normalizedEmail: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

export type DemoAuthSession = {
  id: string;
  userId: string;
  sessionToken: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

export type DemoAuthAuditEvent = {
  id: string;
  userId: string | null;
  eventType: string;
  outcome: string;
  detail: string | null;
  createdAt: string;
};

export type DemoPasswordResetToken = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  usedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

type DemoUserState = {
  holdings: Holding[];
  portfolioHistory: PortfolioPoint[];
  teamsAlertPreference: DemoTeamsAlertPreference | null;
  teamsAlertDeliveries: DemoTeamsAlertDelivery[];
};

type DemoStore = {
  users: DemoUserAccount[];
  credentials: DemoUserCredential[];
  sessions: DemoAuthSession[];
  authAuditEvents: DemoAuthAuditEvent[];
  passwordResetTokens: DemoPasswordResetToken[];
  userStateById: Record<string, DemoUserState>;
  holdings: Holding[];
  portfolioHistory: PortfolioPoint[];
  teamsAlertPreference: DemoTeamsAlertPreference | null;
  teamsAlertDeliveries: DemoTeamsAlertDelivery[];
};

declare global {
  var __demoStore: DemoStore | undefined;
}

const LEGACY_USER_ID = "demo-user";

function createEmptyUserState(): DemoUserState {
  return {
    holdings: [],
    portfolioHistory: [],
    teamsAlertPreference: null,
    teamsAlertDeliveries: []
  };
}

function createLegacyUserState(): DemoUserState {
  return {
    holdings: [...demoPortfolio],
    portfolioHistory: [...demoPortfolioHistory],
    teamsAlertPreference: null,
    teamsAlertDeliveries: []
  };
}

function attachLegacyCompatibility(store: Omit<DemoStore, "holdings" | "portfolioHistory" | "teamsAlertPreference" | "teamsAlertDeliveries">): DemoStore {
  return Object.defineProperties(store, {
    holdings: {
      get() {
        return getDemoUserState(LEGACY_USER_ID).holdings;
      }
    },
    portfolioHistory: {
      get() {
        return getDemoUserState(LEGACY_USER_ID).portfolioHistory;
      }
    },
    teamsAlertPreference: {
      get() {
        return getDemoUserState(LEGACY_USER_ID).teamsAlertPreference;
      },
      set(value: DemoTeamsAlertPreference | null) {
        getDemoUserState(LEGACY_USER_ID).teamsAlertPreference = value;
      }
    },
    teamsAlertDeliveries: {
      get() {
        return getDemoUserState(LEGACY_USER_ID).teamsAlertDeliveries;
      }
    }
  }) as DemoStore;
}

export function getDemoStore() {
  if (!global.__demoStore) {
    global.__demoStore = attachLegacyCompatibility({
      users: [
        {
          id: LEGACY_USER_ID,
          email: "collector@local.tcg",
          displayName: "Collector",
          isLegacyDefault: true,
          legacyClaimedAt: null
        }
      ],
      credentials: [],
      sessions: [],
      authAuditEvents: [],
      passwordResetTokens: [],
      userStateById: {
        [LEGACY_USER_ID]: createLegacyUserState()
      }
    });
  }

  return global.__demoStore;
}

export function getDemoUserState(userId: string) {
  const store = getDemoStore();

  if (!store.userStateById[userId]) {
    store.userStateById[userId] = createEmptyUserState();
  }

  return store.userStateById[userId];
}

export function getDemoCards() {
  return demoCards;
}

export function findDemoUserByEmail(normalizedEmail: string) {
  return getDemoStore().users.find(
    (user) => user.email.trim().toLowerCase() === normalizedEmail
  );
}

export function createDemoUserAccount(input: {
  id: string;
  email: string;
  displayName: string;
}) {
  const store = getDemoStore();
  const user: DemoUserAccount = {
    id: input.id,
    email: input.email,
    displayName: input.displayName,
    isLegacyDefault: false,
    legacyClaimedAt: null
  };

  store.users.push(user);
  getDemoUserState(user.id);
  return user;
}

export function resetDemoStore() {
  global.__demoStore = undefined;
}
