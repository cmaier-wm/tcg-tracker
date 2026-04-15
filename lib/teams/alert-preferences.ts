import { prisma } from "@/lib/db/prisma";
import { badRequest } from "@/lib/api/http-errors";
import {
  type DemoTeamsAlertDelivery,
  type DemoTeamsAlertPreference,
  getDemoUserState
} from "@/lib/db/demo-store";
import { requireAuthenticatedUser } from "@/lib/auth/auth-session";
import { withDatabaseFallback } from "@/lib/db/runtime";
import { getAuthenticatedUserAccount } from "@/lib/portfolio/db-portfolio";
import { getPortfolio } from "@/lib/portfolio/get-portfolio";
import { decryptWebhookUrl, encryptWebhookUrl } from "@/lib/teams/encrypt-webhook";
import {
  type TeamsAlertHistoryEntry,
  type TeamsAlertHistoryResponse,
  type TeamsAlertDeliveryStatus,
  type TeamsAlertSettingsPayload,
  type TeamsAlertSettingsResponse,
  type ThemeMode
} from "@/lib/teams/schemas";

type DeliveryPreferenceRecord = {
  userId: string;
  displayName: string;
  preferenceId: string;
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

function getDeliveryStatus(preference: {
  lastDeliveredAt: string | null;
  lastFailureAt: string | null;
}): TeamsAlertDeliveryStatus {
  if (
    preference.lastFailureAt &&
    (!preference.lastDeliveredAt || preference.lastFailureAt >= preference.lastDeliveredAt)
  ) {
    return "failed";
  }

  if (preference.lastDeliveredAt) {
    return "sent";
  }

  return "idle";
}

function toSettingsResponse(
  preference: {
    themeMode?: ThemeMode | null;
    enabled: boolean;
    destinationLabel: string | null;
    triggerAmountUsd: number;
    encryptedWebhookUrl: string | null;
    webhookUrlIv?: string | null;
    baselineValue: number | null;
    lastEvaluatedAt: string | null;
    lastDeliveredAt: string | null;
    lastFailureAt: string | null;
    lastFailureMessage: string | null;
  } | null
): TeamsAlertSettingsResponse {
  if (!preference) {
    return {
      themeMode: "light",
      enabled: false,
      destinationLabel: null,
      triggerAmountUsd: 1000,
      hasWebhookUrl: false,
      webhookUrl: null,
      baselineValue: null,
      lastEvaluatedAt: null,
      lastDeliveredAt: null,
      lastFailureAt: null,
      lastFailureMessage: null,
      deliveryStatus: "idle"
    };
  }

  return {
    themeMode: preference.themeMode ?? "light",
    enabled: preference.enabled,
    destinationLabel: preference.destinationLabel,
    triggerAmountUsd: preference.triggerAmountUsd ?? 1000,
    hasWebhookUrl: Boolean(preference.encryptedWebhookUrl),
    webhookUrl: tryDecryptWebhookUrl(preference.encryptedWebhookUrl, preference.webhookUrlIv),
    baselineValue: preference.baselineValue,
    lastEvaluatedAt: preference.lastEvaluatedAt,
    lastDeliveredAt: preference.lastDeliveredAt,
    lastFailureAt: preference.lastFailureAt,
    lastFailureMessage: preference.lastFailureMessage,
    deliveryStatus: getDeliveryStatus(preference)
  };
}

function generateStoreId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function toHistoryEntry(delivery: {
  id: string;
  capturedAt: string;
  portfolioValue: number;
  baselineValue: number;
  gainAmount: number;
  status: string;
  responseCode: number | null;
  failureMessage: string | null;
}): TeamsAlertHistoryEntry {
  return {
    id: delivery.id,
    capturedAt: delivery.capturedAt,
    portfolioValue: delivery.portfolioValue,
    baselineValue: delivery.baselineValue,
    gainAmount: delivery.gainAmount,
    status: delivery.status === "failed" ? "failed" : delivery.status === "sent" ? "sent" : "idle",
    responseCode: delivery.responseCode,
    failureMessage: delivery.failureMessage
  };
}

function tryDecryptWebhookUrl(
  encryptedWebhookUrl: string | null | undefined,
  webhookUrlIv: string | null | undefined
) {
  if (!encryptedWebhookUrl || !webhookUrlIv) {
    return null;
  }

  try {
    return decryptWebhookUrl(encryptedWebhookUrl, webhookUrlIv);
  } catch {
    return null;
  }
}

export async function getTeamsAlertSettings() {
  const currentPortfolioValue = (await getPortfolio()).totalEstimatedValue;

  return withDatabaseFallback(
    async () => {
      const user = await getAuthenticatedUserAccount();
      const preference = await prisma.teamsAlertPreference.findUnique({
        where: { userId: user.id }
      });

      return toSettingsResponse(
        preference
          ? {
              themeMode: (preference.themeMode as ThemeMode) ?? "light",
              enabled: preference.enabled,
              destinationLabel: preference.destinationLabel,
              triggerAmountUsd: preference.triggerAmountUsd ?? 1000,
              encryptedWebhookUrl: preference.encryptedWebhookUrl,
              webhookUrlIv: preference.webhookUrlIv,
              baselineValue: preference.enabled
                ? preference.baselineValue
                : currentPortfolioValue,
              lastEvaluatedAt: preference.lastEvaluatedAt?.toISOString() ?? null,
              lastDeliveredAt: preference.lastDeliveredAt?.toISOString() ?? null,
              lastFailureAt: preference.lastFailureAt?.toISOString() ?? null,
              lastFailureMessage: preference.lastFailureMessage
            }
          : null
      );
    },
    async () => {
      const user = await requireAuthenticatedUser();
      return toSettingsResponse(getDemoUserState(user.userId).teamsAlertPreference);
    }
  );
}

export async function upsertTeamsAlertSettings(input: TeamsAlertSettingsPayload) {
  const nextPortfolioValue = (await getPortfolio()).totalEstimatedValue;

  return withDatabaseFallback(
    async () => {
      const user = await getAuthenticatedUserAccount();
      const existing = await prisma.teamsAlertPreference.findUnique({
        where: { userId: user.id }
      });

      let shouldResetBaseline = !existing;
      const themeMode = input.themeMode ?? ((existing?.themeMode as ThemeMode | undefined) ?? "light");
      let encryptedWebhookUrl = existing?.encryptedWebhookUrl ?? null;
      let webhookUrlIv = existing?.webhookUrlIv ?? null;
      let destinationLabel = input.destinationLabel !== undefined
        ? input.destinationLabel
        : (existing?.destinationLabel ?? null);
      let triggerAmountUsd = input.triggerAmountUsd ?? existing?.triggerAmountUsd ?? 1000;
      const nextEnabled = input.enabled ?? existing?.enabled ?? false;

      if (nextEnabled) {
        const nextWebhookUrl =
          input.webhookUrl !== undefined && input.webhookUrl !== null
            ? input.webhookUrl
            : tryDecryptWebhookUrl(existing?.encryptedWebhookUrl, existing?.webhookUrlIv);

        if (!nextWebhookUrl) {
          throw badRequest("A Teams workflow webhook URL is required when alerts are enabled.");
        }

        if (!destinationLabel) {
          throw badRequest("A destination label is required when alerts are enabled.");
        }

        const encrypted = encryptWebhookUrl(nextWebhookUrl);
        const previousWebhookUrl = tryDecryptWebhookUrl(
          existing?.encryptedWebhookUrl,
          existing?.webhookUrlIv
        );

        encryptedWebhookUrl = encrypted.encryptedWebhookUrl;
        webhookUrlIv = encrypted.webhookUrlIv;
        shouldResetBaseline =
          !existing ||
          !existing.enabled ||
          existing.destinationLabel !== destinationLabel ||
          existing.triggerAmountUsd !== triggerAmountUsd ||
          previousWebhookUrl !== nextWebhookUrl;
      } else if (input.webhookUrl && input.webhookUrl.length > 0) {
        const encrypted = encryptWebhookUrl(input.webhookUrl);
        encryptedWebhookUrl = encrypted.encryptedWebhookUrl;
        webhookUrlIv = encrypted.webhookUrlIv;
      }

      const preference = await prisma.teamsAlertPreference.upsert({
        where: { userId: user.id },
        update: {
          themeMode,
          enabled: nextEnabled,
          destinationLabel,
          triggerAmountUsd,
          encryptedWebhookUrl,
          webhookUrlIv,
          baselineValue: !nextEnabled
            ? nextPortfolioValue
            : shouldResetBaseline
            ? nextPortfolioValue
            : existing?.baselineValue ?? nextPortfolioValue,
          lastFailureAt: null,
          lastFailureMessage: null
        },
        create: {
          userId: user.id,
          themeMode,
          enabled: nextEnabled,
          destinationLabel,
          triggerAmountUsd,
          encryptedWebhookUrl,
          webhookUrlIv,
          baselineValue: nextPortfolioValue
        }
      });

      return toSettingsResponse({
        themeMode: preference.themeMode as ThemeMode,
        enabled: preference.enabled,
        destinationLabel: preference.destinationLabel,
        triggerAmountUsd: preference.triggerAmountUsd,
        encryptedWebhookUrl: preference.encryptedWebhookUrl,
        webhookUrlIv: preference.webhookUrlIv,
        baselineValue: preference.baselineValue,
        lastEvaluatedAt: preference.lastEvaluatedAt?.toISOString() ?? null,
        lastDeliveredAt: preference.lastDeliveredAt?.toISOString() ?? null,
        lastFailureAt: preference.lastFailureAt?.toISOString() ?? null,
        lastFailureMessage: preference.lastFailureMessage
      });
    },
    async () => {
      const user = await requireAuthenticatedUser();
      const store = getDemoUserState(user.userId);
      const previous = store.teamsAlertPreference;
      const themeMode = input.themeMode ?? previous?.themeMode ?? "light";
      let nextPreference: DemoTeamsAlertPreference;
      const nextEnabled = input.enabled ?? previous?.enabled ?? false;
      const destinationLabel =
        input.destinationLabel !== undefined ? input.destinationLabel : previous?.destinationLabel ?? null;
      const triggerAmountUsd = input.triggerAmountUsd ?? previous?.triggerAmountUsd ?? 1000;

      if (nextEnabled) {
        const nextWebhookUrl =
          input.webhookUrl !== undefined && input.webhookUrl !== null
            ? input.webhookUrl
            : tryDecryptWebhookUrl(previous?.encryptedWebhookUrl, previous?.webhookUrlIv);

        if (!nextWebhookUrl) {
          throw badRequest("A Teams workflow webhook URL is required when alerts are enabled.");
        }

        if (!destinationLabel) {
          throw badRequest("A destination label is required when alerts are enabled.");
        }

        const encrypted = encryptWebhookUrl(nextWebhookUrl);
        const previousWebhookUrl = tryDecryptWebhookUrl(
          previous?.encryptedWebhookUrl,
          previous?.webhookUrlIv
        );
        const shouldResetBaseline =
          !previous ||
          !previous.enabled ||
          previous.destinationLabel !== destinationLabel ||
          previous.triggerAmountUsd !== triggerAmountUsd ||
          previousWebhookUrl !== nextWebhookUrl;

        nextPreference = {
          id: previous?.id ?? generateStoreId("teams-pref"),
          themeMode,
          enabled: true,
          destinationLabel,
          triggerAmountUsd,
          encryptedWebhookUrl: encrypted.encryptedWebhookUrl,
          webhookUrlIv: encrypted.webhookUrlIv,
          baselineValue: shouldResetBaseline
            ? nextPortfolioValue
            : previous?.baselineValue ?? nextPortfolioValue,
          lastEvaluatedAt: previous?.lastEvaluatedAt ?? null,
          lastDeliveredAt: previous?.lastDeliveredAt ?? null,
          lastFailureAt: null,
          lastFailureMessage: null
        };
      } else {
        let encryptedWebhookUrl = previous?.encryptedWebhookUrl ?? null;
        let webhookUrlIv = previous?.webhookUrlIv ?? null;

        if (input.webhookUrl && input.webhookUrl.length > 0) {
          const encrypted = encryptWebhookUrl(input.webhookUrl);
          encryptedWebhookUrl = encrypted.encryptedWebhookUrl;
          webhookUrlIv = encrypted.webhookUrlIv;
        }

        nextPreference = {
          id: previous?.id ?? generateStoreId("teams-pref"),
          themeMode,
          enabled: false,
          destinationLabel,
          triggerAmountUsd,
          encryptedWebhookUrl,
          webhookUrlIv,
          baselineValue: nextPortfolioValue,
          lastEvaluatedAt: previous?.lastEvaluatedAt ?? null,
          lastDeliveredAt: previous?.lastDeliveredAt ?? null,
          lastFailureAt: null,
          lastFailureMessage: null
        };
      }

      store.teamsAlertPreference = nextPreference;
      return toSettingsResponse(nextPreference);
    }
  );
}

export async function getAccountThemeMode(userId: string | null | undefined): Promise<ThemeMode> {
  if (!userId) {
    return "light";
  }

  return withDatabaseFallback(
    async () => {
      const preference = await prisma.teamsAlertPreference.findUnique({
        where: { userId },
        select: { themeMode: true }
      });

      return (preference?.themeMode as ThemeMode | undefined) ?? "light";
    },
    async () => getDemoUserState(userId).teamsAlertPreference?.themeMode ?? "light"
  );
}

export async function getTeamsAlertPreferenceForDelivery(): Promise<DeliveryPreferenceRecord | null> {
  return withDatabaseFallback(
    async () => {
      const user = await getAuthenticatedUserAccount();
      const preference = await prisma.teamsAlertPreference.findUnique({
        where: { userId: user.id }
      });

      if (!preference) {
        return null;
      }

      return {
        userId: user.id,
        displayName: user.displayName,
        preferenceId: preference.id,
        enabled: preference.enabled,
        destinationLabel: preference.destinationLabel,
        triggerAmountUsd: preference.triggerAmountUsd ?? 1000,
        encryptedWebhookUrl: preference.encryptedWebhookUrl,
        webhookUrlIv: preference.webhookUrlIv,
        baselineValue: preference.baselineValue,
        lastEvaluatedAt: preference.lastEvaluatedAt?.toISOString() ?? null,
        lastDeliveredAt: preference.lastDeliveredAt?.toISOString() ?? null,
        lastFailureAt: preference.lastFailureAt?.toISOString() ?? null,
        lastFailureMessage: preference.lastFailureMessage
      };
    },
    async () => {
      const user = await requireAuthenticatedUser();
      const preference = getDemoUserState(user.userId).teamsAlertPreference;

      if (!preference) {
        return null;
      }

      return {
        userId: user.userId,
        displayName: user.displayName,
        preferenceId: preference.id,
        enabled: preference.enabled,
        destinationLabel: preference.destinationLabel,
        triggerAmountUsd: preference.triggerAmountUsd ?? 1000,
        encryptedWebhookUrl: preference.encryptedWebhookUrl,
        webhookUrlIv: preference.webhookUrlIv,
        baselineValue: preference.baselineValue,
        lastEvaluatedAt: preference.lastEvaluatedAt,
        lastDeliveredAt: preference.lastDeliveredAt,
        lastFailureAt: preference.lastFailureAt,
        lastFailureMessage: preference.lastFailureMessage
      };
    }
  );
}

export async function getTeamsAlertDeliveryHistory(input?: {
  page?: number;
  pageSize?: number;
}): Promise<TeamsAlertHistoryResponse> {
  const pageSize = Math.min(Math.max(input?.pageSize ?? 5, 1), 25);
  const page = Math.max(input?.page ?? 1, 1);
  const skip = (page - 1) * pageSize;

  return withDatabaseFallback(
    async () => {
      const user = await getAuthenticatedUserAccount();
      const [totalItems, deliveries] = await Promise.all([
        prisma.teamsAlertDelivery.count({
          where: { userId: user.id }
        }),
        prisma.teamsAlertDelivery.findMany({
          where: { userId: user.id },
          orderBy: [{ capturedAt: "desc" }, { createdAt: "desc" }, { id: "desc" }],
          skip,
          take: pageSize
        })
      ]);

      return {
        items: deliveries.map((delivery) =>
          toHistoryEntry({
            id: delivery.id,
            capturedAt: delivery.capturedAt.toISOString(),
            portfolioValue: delivery.portfolioValue,
            baselineValue: delivery.baselineValue,
            gainAmount: delivery.gainAmount,
            status: delivery.status,
            responseCode: delivery.responseCode,
            failureMessage: delivery.failureMessage
          })
        ),
        page,
        pageSize,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / pageSize))
      };
    },
    async () => {
      const user = await requireAuthenticatedUser();
      const deliveries = [...getDemoUserState(user.userId).teamsAlertDeliveries].sort(
        (left, right) => right.capturedAt.localeCompare(left.capturedAt)
      );
      const totalItems = deliveries.length;

      return {
        items: deliveries.slice(skip, skip + pageSize).map(toHistoryEntry),
        page,
        pageSize,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / pageSize))
      };
    }
  );
}

export async function touchTeamsAlertEvaluation(capturedAt: string) {
  return withDatabaseFallback(
    async () => {
      const user = await getAuthenticatedUserAccount();
      await prisma.teamsAlertPreference.updateMany({
        where: { userId: user.id },
        data: {
          lastEvaluatedAt: new Date(capturedAt)
        }
      });
    },
    async () => {
      const user = await requireAuthenticatedUser();
      const store = getDemoUserState(user.userId);

      if (store.teamsAlertPreference) {
        store.teamsAlertPreference.lastEvaluatedAt = capturedAt;
      }
    }
  );
}

export async function recordTeamsAlertDeliveryAttempt(input: {
  preferenceId: string;
  userId: string;
  capturedAt: string;
  portfolioValue: number;
  baselineValue: number;
  gainAmount: number;
  status: "sent" | "failed";
  responseCode: number | null;
  failureMessage: string | null;
}) {
  return withDatabaseFallback(
    async () => {
      await prisma.teamsAlertDelivery.create({
        data: {
          userId: input.userId,
          preferenceId: input.preferenceId,
          capturedAt: new Date(input.capturedAt),
          portfolioValue: input.portfolioValue,
          baselineValue: input.baselineValue,
          gainAmount: input.gainAmount,
          status: input.status,
          failureMessage: input.failureMessage,
          responseCode: input.responseCode
        }
      });

      await prisma.teamsAlertPreference.update({
        where: { id: input.preferenceId },
        data: {
          baselineValue: input.status === "sent" ? input.portfolioValue : undefined,
          lastEvaluatedAt: new Date(input.capturedAt),
          lastDeliveredAt: input.status === "sent" ? new Date(input.capturedAt) : undefined,
          lastFailureAt: input.status === "failed" ? new Date(input.capturedAt) : null,
          lastFailureMessage: input.failureMessage
        }
      });
    },
    async () => {
      const store = getDemoUserState(input.userId);
      const preference = store.teamsAlertPreference;

      if (!preference) {
        return;
      }

      const delivery: DemoTeamsAlertDelivery = {
        id: generateStoreId("teams-delivery"),
        userId: input.userId,
        preferenceId: input.preferenceId,
        capturedAt: input.capturedAt,
        portfolioValue: input.portfolioValue,
        baselineValue: input.baselineValue,
        gainAmount: input.gainAmount,
        status: input.status,
        failureMessage: input.failureMessage,
        responseCode: input.responseCode,
        createdAt: input.capturedAt
      };

      store.teamsAlertDeliveries.push(delivery);
      preference.lastEvaluatedAt = input.capturedAt;
      preference.lastFailureMessage = input.failureMessage;

      if (input.status === "sent") {
        preference.baselineValue = input.portfolioValue;
        preference.lastDeliveredAt = input.capturedAt;
        preference.lastFailureAt = null;
      } else {
        preference.lastFailureAt = input.capturedAt;
      }
    }
  );
}

export async function recordTeamsAlertFailure(input: {
  preferenceId: string;
  capturedAt: string;
  failureMessage: string;
}) {
  return withDatabaseFallback(
    async () => {
      await prisma.teamsAlertPreference.update({
        where: { id: input.preferenceId },
        data: {
          lastEvaluatedAt: new Date(input.capturedAt),
          lastFailureAt: new Date(input.capturedAt),
          lastFailureMessage: input.failureMessage
        }
      });
    },
    async () => {
      const user = await requireAuthenticatedUser();
      const preference = getDemoUserState(user.userId).teamsAlertPreference;

      if (preference) {
        preference.lastEvaluatedAt = input.capturedAt;
        preference.lastFailureAt = input.capturedAt;
        preference.lastFailureMessage = input.failureMessage;
      }
    }
  );
}
