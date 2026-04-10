import fs from "node:fs/promises";
import ExcelJS from "exceljs";
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

test("download a portfolio export", async ({ page }) => {
  const credentials = createTestCredentials("portfolio-export");

  await registerWithUi(page, credentials);
  await page.goto("/cards/pokemon/sv1-charizard-ex");
  await page.getByRole("button", { name: "Save Holding" }).click();
  await expect(page).toHaveURL(/\/portfolio$/);
  await expect(page.getByText("Charizard ex")).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Portfolio" }).click();
  const download = await downloadPromise;
  const downloadPath = await download.path();
  const workbook = new ExcelJS.Workbook();

  await expect(page.getByText("Portfolio export downloaded.")).toBeVisible();
  expect(download.suggestedFilename()).toMatch(/portfolio-export-\d{4}-\d{2}-\d{2}\.xlsx/);
  expect(downloadPath).toBeTruthy();

  await workbook.xlsx.load(await fs.readFile(downloadPath!));

  const worksheet = workbook.getWorksheet("Portfolio");

  expect(worksheet.getRow(1).values.slice(1)).toEqual([
    "Category",
    "Set",
    "Card",
    "Collector Number",
    "Variation",
    "Quantity",
    "Unit Market Price",
    "Estimated Value",
    "Date Added"
  ]);
  expect(worksheet.getRow(2).getCell(3).value).toBe("Charizard ex");
});

test("reject export when the session is missing", async ({ page }) => {
  const response = await page.request.get("/api/portfolio/export");
  const payload = await response.json();

  expect(response.status()).toBe(401);
  expect(payload.error).toBe("Authentication is required.");
});
