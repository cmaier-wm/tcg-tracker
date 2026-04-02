import { expect, test } from "@playwright/test";

test("show current price and chart content", async ({ page }) => {
  await page.goto("/cards/pokemon/sv1-charizard-ex");
  await expect(page.getByText("Current price")).toBeVisible();
  await expect(page.getByText("Price history")).toBeVisible();
});

