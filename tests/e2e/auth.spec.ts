import { expect, test } from "@playwright/test";
import {
  createTestCredentials,
  loginWithUi,
  registerWithUi,
  signOutWithUi
} from "@/tests/e2e/auth-helpers";

test("registers, signs out, signs back in, and preserves public returnTo flows", async ({
  page
}) => {
  const credentials = createTestCredentials("auth");

  await registerWithUi(page, credentials, {
    returnTo: "/cards"
  });
  await expect(page).toHaveURL(/\/cards$/);
  await expect(page.getByText("Pokémon Card Browser")).toBeVisible();

  await signOutWithUi(page);
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();

  await loginWithUi(page, credentials, {
    returnTo: "/cards"
  });
  await expect(page).toHaveURL(/\/cards$/);

  await signOutWithUi(page);

  await page.goto("/portfolio");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
});
