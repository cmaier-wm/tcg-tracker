import { expect, test } from "@playwright/test";

test("show current price and chart content", async ({ page }) => {
  await page.goto("/cards/pokemon/sv1-charizard-ex");
  await page.getByRole("link", { name: "Japanese / Holo / NM" }).click();
  await expect(page.getByText("Current price")).toBeVisible();
  await expect(page.getByText("Price history")).toBeVisible();
  await expect(page.getByText("Japanese / Holo / NM")).toBeVisible();
});
