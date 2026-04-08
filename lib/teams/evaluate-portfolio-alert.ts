import { buildTeamsWorkflowPayload, deliverTeamsWorkflowAlert } from "@/lib/teams/alert-delivery";
import {
  getTeamsAlertPreferenceForDelivery,
  recordTeamsAlertDeliveryAttempt,
  recordTeamsAlertFailure,
  touchTeamsAlertEvaluation
} from "@/lib/teams/alert-preferences";
import { decryptWebhookUrl } from "@/lib/teams/encrypt-webhook";

export async function evaluatePortfolioAlert(input: {
  capturedAt: string;
  portfolioValue: number;
}) {
  const preference = await getTeamsAlertPreferenceForDelivery();

  if (!preference || !preference.enabled) {
    return { status: "idle" as const, reason: "disabled" as const };
  }

  await touchTeamsAlertEvaluation(input.capturedAt);

  if (
    !preference.destinationLabel ||
    !preference.encryptedWebhookUrl ||
    !preference.webhookUrlIv ||
    preference.baselineValue == null
  ) {
    return { status: "idle" as const, reason: "missing-destination" as const };
  }

  const gainAmount = input.portfolioValue - preference.baselineValue;

  if (gainAmount <= preference.triggerAmountUsd) {
    return { status: "idle" as const, reason: "threshold-not-met" as const, gainAmount };
  }

  let webhookUrl: string;

  try {
    webhookUrl = decryptWebhookUrl(
      preference.encryptedWebhookUrl,
      preference.webhookUrlIv
    );
  } catch (error) {
    const failureMessage =
      error instanceof Error ? error.message : "Unable to read Teams webhook settings.";

    await recordTeamsAlertFailure({
      preferenceId: preference.preferenceId,
      capturedAt: input.capturedAt,
      failureMessage
    });

    return { status: "failed" as const, reason: "delivery-failed" as const, failureMessage };
  }

  const payload = buildTeamsWorkflowPayload({
    capturedAt: input.capturedAt,
    portfolioValue: input.portfolioValue,
    baselineValue: preference.baselineValue,
    gainAmount,
    destinationLabel: preference.destinationLabel,
    userDisplayName: preference.displayName
  });
  const result = await deliverTeamsWorkflowAlert(webhookUrl, payload);

  await recordTeamsAlertDeliveryAttempt({
    preferenceId: preference.preferenceId,
    userId: preference.userId,
    capturedAt: input.capturedAt,
    portfolioValue: input.portfolioValue,
    baselineValue: preference.baselineValue,
    gainAmount,
    status: result.status,
    responseCode: result.responseCode,
    failureMessage: result.failureMessage
  });

  if (result.status === "failed") {
    return {
      status: "failed" as const,
      reason: "delivery-failed" as const,
      failureMessage: result.failureMessage,
      gainAmount
    };
  }

  return { status: "sent" as const, reason: "send-required" as const, gainAmount };
}
