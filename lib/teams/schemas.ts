import { z } from "zod";

export const teamsAlertSettingsPayloadSchema = z
  .object({
    enabled: z.boolean().optional(),
    destinationLabel: z
      .union([z.string(), z.null(), z.undefined()])
      .transform((value) => (typeof value === "string" ? value.trim() : value))
      .refine(
        (value) => value === undefined || value === null || (typeof value === "string" && value.length >= 1 && value.length <= 120),
        { message: "Destination label must be between 1 and 120 characters." }
      ),
    triggerAmountUsd: z.number().int().min(1).max(1_000_000).optional(),
    webhookUrl: z
      .union([z.string(), z.null(), z.undefined()])
      .transform((value) => (typeof value === "string" ? value.trim() : value))
      .refine((value) => value === undefined || value === null || z.string().url().safeParse(value).success, {
        message: "Invalid url"
      })
  })
  .refine(
    (value) =>
      value.enabled !== undefined ||
      value.destinationLabel !== undefined ||
      value.triggerAmountUsd !== undefined ||
      value.webhookUrl !== undefined,
    {
      message: "At least one settings field must be provided."
    }
  );

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
