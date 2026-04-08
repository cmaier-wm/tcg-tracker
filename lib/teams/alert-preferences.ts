import { prisma } from "@/lib/db/prisma";
import { badRequest } from "@/lib/api/http-errors";
import {
  type DemoTeamsAlertDelivery,
  type DemoTeamsAlertPreference,
  getDemoStore
} from "@/lib/db/demo-store";
import { withDatabaseFallback } from "@/lib/db/runtime";
import { getDefaultUserAccount } from "@/lib/portfolio/db-portfolio";
import { getPortfolio } from "@/lib/portfolio/get-portfolio";
import { decryptWebhookUrl, encryptWebhookUrl } from "@/lib/teams/encrypt-webhook";
import {
  type TeamsAlertHistoryEntry,
  type TeamsAlertHistoryResponse,
  type TeamsAlertDeliveryStatus,
  type TeamsAlertSettingsPayload,
  type TeamsAlertSettingsResponse
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
      const user = await getDefaultUserAccount();
      const preference = await prisma.teamsAlertPreference.findUnique({
        where: { userId: user.id }
      });

      return toSettingsResponse(
        preference
          ? {
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
    async () => toSettingsResponse(getDemoStore().teamsAlertPreference)
  );
}

export async function upsertTeamsAlertSettings(input: TeamsAlertSettingsPayload) {
  const nextPortfolioValue = (await getPortfolio()).totalEstimatedValue;

  return withDatabaseFallback(
    async () => {
      const user = await getDefaultUserAccount();
      const existing = await prisma.teamsAlertPreference.findUnique({
        where: { userId: user.id }
      });

      let shouldResetBaseline = !existing;
      let encryptedWebhookUrl = existing?.encryptedWebhookUrl ?? null;
      let webhookUrlIv = existing?.webhookUrlIv ?? null;
      let destinationLabel = existing?.destinationLabel ?? null;
      let triggerAmountUsd = input.triggerAmountUsd;

      if (input.enabled) {
        const nextWebhookUrl =
          input.webhookUrl ??
          tryDecryptWebhookUrl(existing?.encryptedWebhookUrl, existing?.webhookUrlIv);

        if (!nextWebhookUrl) {
          throw badRequest("A Teams workflow webhook URL is required when alerts are enabled.");
        }

        const encrypted = encryptWebhookUrl(nextWebhookUrl);
        const previousWebhookUrl = tryDecryptWebhookUrl(
          existing?.encryptedWebhookUrl,
          existing?.webhookUrlIv
        );

        encryptedWebhookUrl = encrypted.encryptedWebhookUrl;
        webhookUrlIv = encrypted.webhookUrlIv;
        destinationLabel = input.destinationLabel;
        triggerAmountUsd = input.triggerAmountUsd;
        shouldResetBaseline =
          !existing ||
          !existing.enabled ||
          existing.destinationLabel !== input.destinationLabel ||
          existing.triggerAmountUsd !== input.triggerAmountUsd ||
          previousWebhookUrl !== nextWebhookUrl;
      }

      const preference = await prisma.teamsAlertPreference.upsert({
        where: { userId: user.id },
        update: {
          enabled: input.enabled,
          destinationLabel,
          triggerAmountUsd,
          encryptedWebhookUrl,
          webhookUrlIv,
          baselineValue: shouldResetBaseline
            ? nextPortfolioValue
            : existing?.baselineValue ?? nextPortfolioValue,
          lastFailureAt: null,
          lastFailureMessage: null
        },
        create: {
          userId: user.id,
          enabled: input.enabled,
          destinationLabel,
          triggerAmountUsd: input.triggerAmountUsd,
          encryptedWebhookUrl,
          webhookUrlIv,
          baselineValue: nextPortfolioValue
        }
      });

      return toSettingsResponse({
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
      const store = getDemoStore();
      const previous = store.teamsAlertPreference;
      let nextPreference: DemoTeamsAlertPreference;

      if (input.enabled) {
        const nextWebhookUrl =
          input.webhookUrl ??
          tryDecryptWebhookUrl(previous?.encryptedWebhookUrl, previous?.webhookUrlIv);

        if (!nextWebhookUrl) {
          throw badRequest("A Teams workflow webhook URL is required when alerts are enabled.");
        }

        const encrypted = encryptWebhookUrl(nextWebhookUrl);
        const previousWebhookUrl = tryDecryptWebhookUrl(
          previous?.encryptedWebhookUrl,
          previous?.webhookUrlIv
        );
        const shouldResetBaseline =
          !previous ||
          !previous.enabled ||
          previous.destinationLabel !== input.destinationLabel ||
          previous.triggerAmountUsd !== input.triggerAmountUsd ||
          previousWebhookUrl !== nextWebhookUrl;

        nextPreference = {
          id: previous?.id ?? generateStoreId("teams-pref"),
          enabled: true,
          destinationLabel: input.destinationLabel,
          triggerAmountUsd: input.triggerAmountUsd,
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
        nextPreference = {
          id: previous?.id ?? generateStoreId("teams-pref"),
          enabled: false,
          destinationLabel: previous?.destinationLabel ?? input.destinationLabel,
          triggerAmountUsd: input.triggerAmountUsd,
          encryptedWebhookUrl: previous?.encryptedWebhookUrl ?? null,
          webhookUrlIv: previous?.webhookUrlIv ?? null,
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

export async function getTeamsAlertPreferenceForDelivery(): Promise<DeliveryPreferenceRecord | null> {
  return withDatabaseFallback(
    async () => {
      const user = await getDefaultUserAccount();
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
      const preference = getDemoStore().teamsAlertPreference;

      if (!preference) {
        return null;
      }

      return {
        userId: "demo-user",
        displayName: "Collector",
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
      const user = await getDefaultUserAccount();
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
      const deliveries = [...getDemoStore().teamsAlertDeliveries].sort((left, right) =>
        right.capturedAt.localeCompare(left.capturedAt)
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
      const user = await getDefaultUserAccount();
      await prisma.teamsAlertPreference.updateMany({
        where: { userId: user.id },
        data: {
          lastEvaluatedAt: new Date(capturedAt)
        }
      });
    },
    async () => {
      const store = getDemoStore();

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
      const store = getDemoStore();
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
      const preference = getDemoStore().teamsAlertPreference;

      if (preference) {
        preference.lastEvaluatedAt = input.capturedAt;
        preference.lastFailureAt = input.capturedAt;
        preference.lastFailureMessage = input.failureMessage;
      }
    }
  );
}
