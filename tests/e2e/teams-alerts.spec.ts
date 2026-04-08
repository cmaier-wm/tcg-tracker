import http from "node:http";
import { expect, test } from "@playwright/test";

test("sends one Teams alert per qualifying gain range", async ({ page, request }) => {
  const receivedPayloads: unknown[] = [];
  const webhookServer = http.createServer((req, res) => {
    if (req.method !== "POST") {
      res.writeHead(405).end();
      return;
    }

    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      receivedPayloads.push(JSON.parse(body));
      res.writeHead(202).end();
    });
  });

  await new Promise<void>((resolve) => webhookServer.listen(0, "127.0.0.1", resolve));
  const address = webhookServer.address();
  const port = typeof address === "object" && address ? address.port : 0;

  try {
    await page.goto("/settings");
    await expect(page.getByRole("checkbox", { name: "Teams alerts toggle" })).toBeEnabled();
    await page.getByLabel("Destination Label").fill("Trading alerts");
    await page
      .getByLabel("Teams Workflow Webhook URL")
      .fill(`http://127.0.0.1:${port}/teams-hook`);
    await page.getByRole("checkbox", { name: "Teams alerts toggle" }).check();
    await page.getByRole("button", { name: "Save Teams Alerts" }).click();

    await expect(page.getByText("Teams alerts saved.")).toBeVisible();

    const addResponse = await request.post("/api/portfolio", {
      headers: {
        "Content-Type": "application/json"
      },
      data: JSON.stringify({
        cardVariationId: "onepiece-luffy-en-foil",
        quantity: 8
      })
    });

    expect(addResponse.ok()).toBe(true);
    await expect.poll(() => receivedPayloads.length).toBe(1);

    const portfolioResponse = await request.get("/api/portfolio");
    const portfolioPayload = await portfolioResponse.json();
    const holdingId = portfolioPayload.holdings[0]?.id as string;

    expect(holdingId).toBeTruthy();

    const sameQuantityResponse = await request.patch(`/api/portfolio/${holdingId}`, {
      headers: {
        "Content-Type": "application/json"
      },
      data: JSON.stringify({
        quantity: 8
      })
    });

    expect(sameQuantityResponse.ok()).toBe(true);
    await page.waitForTimeout(250);
    expect(receivedPayloads).toHaveLength(1);

    const nextThresholdResponse = await request.patch(`/api/portfolio/${holdingId}`, {
      headers: {
        "Content-Type": "application/json"
      },
      data: JSON.stringify({
        quantity: 16
      })
    });

    expect(nextThresholdResponse.ok()).toBe(true);
    await expect.poll(() => receivedPayloads.length).toBe(2);
  } finally {
    await new Promise<void>((resolve, reject) => {
      webhookServer.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
});
