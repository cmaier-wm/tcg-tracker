import { z } from "zod";

export const teamsAlertSettingsPayloadSchema = z.object({
  enabled: z.boolean(),
  destinationLabel: z.string().trim().min(1).max(120),
  triggerAmountUsd: z.number().int().min(1).max(1_000_000),
  webhookUrl: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => (typeof value === "string" ? value.trim() : null))
    .refine((value) => value === null || z.string().url().safeParse(value).success, {
      message: "Invalid url"
    })
});

export type TeamsAlertSettingsPayload = z.infer<typeof teamsAlertSettingsPayloadSchema>;
export type TeamsAlertDeliveryStatus = "idle" | "sent" | "failed";
export type TeamsAlertHistoryEntry = {
  id: string;
  capturedAt: string;
  portfolioValue: number;
  baselineValue: number;
  gainAmount: number;
  status: TeamsAlertDeliveryStatus;
  responseCode: number | null;
  failureMessage: string | null;
};

export type TeamsAlertHistoryResponse = {
  items: TeamsAlertHistoryEntry[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type TeamsAlertSettingsResponse = {
  enabled: boolean;
  destinationLabel: string | null;
  triggerAmountUsd: number;
  hasWebhookUrl: boolean;
  webhookUrl: string | null;
  baselineValue: number | null;
  lastEvaluatedAt: string | null;
  lastDeliveredAt: string | null;
  lastFailureAt: string | null;
  lastFailureMessage: string | null;
  deliveryStatus: TeamsAlertDeliveryStatus;
};
