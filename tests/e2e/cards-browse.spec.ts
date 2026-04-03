import { expect, test } from "@playwright/test";

test("browse cards and open a detail page", async ({ page }) => {
  await page.goto("/cards");
  await expect(page.getByText("TCG Card Browser")).toBeVisible();
  await page.getByLabel("Search cards").fill("charizard");
  await page.getByRole("button", { name: "Search" }).click();
  await page.getByText("Charizard ex").click();
  await expect(page.getByText("Price History")).toBeVisible();
});
