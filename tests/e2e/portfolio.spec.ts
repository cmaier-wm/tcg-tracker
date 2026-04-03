import { expect, test } from "@playwright/test";

test("view the portfolio summary", async ({ page }) => {
  await page.goto("/portfolio");

  await expect(page.getByText("My Portfolio")).toBeVisible();
  await expect(page.getByText("Your Cards")).toBeVisible();
  await expect(page.getByText("Portfolio Value History")).toBeVisible();
});
