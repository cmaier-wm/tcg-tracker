import { expect, test } from "@playwright/test";

test("view portfolio summary", async ({ page }) => {
  await page.goto("/portfolio");
  await expect(page.getByText("Portfolio value")).toBeVisible();
});

