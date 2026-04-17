import { expect, test } from "@playwright/test";

test("home page supports product type switching without console errors", async ({ page }) => {
  const consoleErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.goto("/");
  await expect(page.getByLabel("Type")).toHaveValue("card");
  await expect(page.locator(".card-grid, .empty-state").first()).toBeVisible();

  await page.getByLabel("Type").selectOption("sealed-product");
  await expect(page).toHaveURL(/productType=sealed-product/);
  await expect(page.locator(".card-grid, .empty-state").first()).toBeVisible();

  const sealedRows = page.locator("article.catalog-card");
  if ((await sealedRows.count()) > 0) {
    await expect(sealedRows.first()).toContainText("Sealed Product");
    await expect(page.locator('a.catalog-card[href^="/cards/"]')).toHaveCount(0);
  } else {
    await expect(page.getByText("No sealed products found")).toBeVisible();
  }

  await page.getByLabel("Search cards").fill("box");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL(/q=box/);
  await expect(page.getByLabel("Search cards")).toHaveValue("box");

  await page.getByLabel("Sort").selectOption("price-asc");
  await expect(page).toHaveURL(/sort=price-asc/);

  await page.getByLabel("Type").selectOption("card");
  await expect(page).not.toHaveURL(/productType=sealed-product/);
  await expect(page.getByLabel("Sort")).toHaveValue("price-asc");

  expect(consoleErrors).toEqual([]);
});

test("home page hides code cards from browse results", async ({ page }) => {
  await page.goto("/");

  await page
    .getByLabel("Search cards")
    .fill("perfect order pokemon center elite trainer box");
  await page.getByRole("button", { name: "Search" }).click();

  await expect(page).toHaveURL(/q=perfect\+order\+pokemon\+center\+elite\+trainer\+box/);
  await expect(
    page.locator("article.catalog-card").filter({ hasText: /^Code Card\b/i })
  ).toHaveCount(0);
});
