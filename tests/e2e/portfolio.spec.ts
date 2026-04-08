import { expect, test } from "@playwright/test";
import { createTestCredentials, registerWithUi } from "@/tests/e2e/auth-helpers";

test("view the portfolio summary", async ({ page }) => {
  const credentials = createTestCredentials("portfolio");

  await registerWithUi(page, credentials);
  await expect(page).toHaveURL(/\/portfolio$/);

  await expect(page.getByText("My Portfolio")).toBeVisible();
  await expect(page.getByText("Your Cards")).toBeVisible();
  await expect(page.getByText("Portfolio Value History")).toBeVisible();
});
