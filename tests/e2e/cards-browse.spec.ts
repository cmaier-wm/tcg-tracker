import { expect, test } from "@playwright/test";

test("browse cards and open a detail page", async ({ page }) => {
  await page.goto("/cards");
  await expect(page.getByText("Cards and variants")).toBeVisible();
  await page.getByText("Charizard ex").click();
  await expect(page.getByText("Price history")).toBeVisible();
});

