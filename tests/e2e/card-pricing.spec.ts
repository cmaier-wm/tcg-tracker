import { expect, test } from "@playwright/test";

test("show current price and chart content", async ({ page }) => {
  await page.goto("/cards/pokemon/sv1-charizard-ex");
  await expect(page.getByText("Current price")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Price History" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Charizard ex" })).toBeVisible();
  await expect(page.getByText("English", { exact: true })).toBeVisible();
});
