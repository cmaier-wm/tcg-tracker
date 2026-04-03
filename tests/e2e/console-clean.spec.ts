import { expect, test } from "@playwright/test";

const pagesToCheck = [
  "/",
  "/cards",
  "/portfolio",
  "/settings",
  "/cards/pokemon/sv1-charizard-ex"
];

test("all primary pages load without console errors", async ({ page }) => {
  const consoleErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  for (const path of pagesToCheck) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
  }

  expect(consoleErrors).toEqual([]);
});
