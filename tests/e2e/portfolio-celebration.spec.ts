import { expect, test } from "@playwright/test";
import { createTestCredentials, registerWithUi } from "@/tests/e2e/auth-helpers";

test("shows the firework celebration before portfolio refresh after quantity changes", async ({
  page
}) => {
  const credentials = createTestCredentials("portfolio-fireworks");

  await registerWithUi(page, credentials);
  await expect(page).toHaveURL(/\/portfolio$/);

  const addHoldingStatus = await page.evaluate(async () => {
    const response = await fetch("/api/portfolio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        cardVariationId: "sv1-charizard-ex-en-nm-holo",
        quantity: 1
      })
    });

    return response.status;
  });

  expect(addHoldingStatus).toBe(200);

  await page.goto("/portfolio");

  const quantityInput = page.getByLabel("Quantity").first();
  await expect(quantityInput).toBeVisible();

  await quantityInput.fill("3");

  const celebration = page.getByRole("status", { name: /quantity updated/i });
  await expect(celebration).toBeVisible();
});
