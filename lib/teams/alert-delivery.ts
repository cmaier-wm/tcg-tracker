type TeamsWorkflowPayload = {
  type: "AdaptiveCard";
  $schema: "http://adaptivecards.io/schemas/adaptive-card.json";
  version: "1.4";
  body: Array<
    | {
        type: "TextBlock";
        text: string;
        weight?: "Bolder";
        size?: "Medium";
        wrap?: true;
        spacing?: "None" | "Medium";
      }
    | {
        type: "FactSet";
        facts: Array<{
          title: string;
          value: string;
        }>;
      }
  >;
};

export type TeamsDeliveryAttemptResult =
  | {
      status: "sent";
      responseCode: number;
      failureMessage: null;
    }
  | {
      status: "failed";
      responseCode: number | null;
      failureMessage: string;
    };

export function buildTeamsWorkflowPayload(input: {
  capturedAt: string;
  portfolioValue: number;
  baselineValue: number;
  gainAmount: number;
  destinationLabel: string;
  userDisplayName: string;
}): TeamsWorkflowPayload {
  const summary = `${input.userDisplayName}'s portfolio gained $${input.gainAmount.toFixed(2)}`;

  return {
    type: "AdaptiveCard",
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    version: "1.4",
    body: [
      {
        type: "TextBlock",
        text: "Portfolio gain alert",
        weight: "Bolder",
        size: "Medium"
      },
      {
        type: "TextBlock",
        text: summary,
        wrap: true,
        spacing: "None"
      },
      {
        type: "FactSet",
        facts: [
          {
            title: "Destination",
            value: input.destinationLabel
          },
          {
            title: "Portfolio value",
            value: `$${input.portfolioValue.toFixed(2)}`
          },
          {
            title: "Gain",
            value: `$${input.gainAmount.toFixed(2)}`
          },
          {
            title: "Previous baseline",
            value: `$${input.baselineValue.toFixed(2)}`
          },
          {
            title: "Evaluated at",
            value: input.capturedAt
          }
        ]
      }
    ]
  };
}

export async function deliverTeamsWorkflowAlert(
  webhookUrl: string,
  payload: TeamsWorkflowPayload
): Promise<TeamsDeliveryAttemptResult> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = (await response.text()).trim();

      return {
        status: "failed",
        responseCode: response.status,
        failureMessage:
          errorText || `Teams workflow rejected the alert request (${response.status}).`
      };
    }

    return {
      status: "sent",
      responseCode: response.status,
      failureMessage: null
    };
  } catch (error) {
    return {
      status: "failed",
      responseCode: null,
      failureMessage:
        error instanceof Error ? error.message : "Teams workflow request failed."
    };
  }
}
