import { expect, test } from "@playwright/test";

test("add a card to the portfolio and view the summary", async ({ page }) => {
  await page.goto("/cards/pokemon/sv1-charizard-ex?variationId=sv1-charizard-ex-jp-nm-holo");
  await page.getByLabel("Quantity").fill("1");
  await page.getByRole("button", { name: "Save holding" }).click();

  await page.waitForURL("**/portfolio");
  await expect(page.getByText("My Portfolio")).toBeVisible();
  await expect(
    page.getByRole("article").filter({ hasText: "Japanese / Holo / NM" })
  ).toBeVisible();
  await expect(page.getByText("Portfolio Value History")).toBeVisible();
});
