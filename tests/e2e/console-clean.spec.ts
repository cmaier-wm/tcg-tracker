import { expect, test } from "@playwright/test";

const pagesToCheck = [
  "/",
  "/cards",
  "/portfolio",
  "/settings",
  "/cards/pokemon/sv1-charizard-ex"
];

test("all primary pages load without console errors", async ({ browser }) => {
  const consoleErrors: string[] = [];

  for (const path of pagesToCheck) {
    const page = await browser.newPage();

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(`${path}: ${message.text()}`);
      }
    });

    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toBeVisible();
    await page.close();
  }

  expect(consoleErrors).toEqual([]);
});
