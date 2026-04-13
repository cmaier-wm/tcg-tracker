import { expect, test } from "@playwright/test";
import {
  createPasswordResetTokenForEmail,
  createTestCredentials,
  ensureAccountExists,
  loginWithUi,
  signOutWithUi,
} from "@/tests/e2e/auth-helpers";

test("requests a password reset with a generic confirmation", async ({ page }) => {
  const credentials = createTestCredentials("reset-request");
  await ensureAccountExists(credentials);

  await page.goto("/login");
  await page.getByRole("link", { name: "Forgot Password?" }).click();
  await expect(page).toHaveURL(/\/reset-password$/);

  await page.getByLabel("Email").fill(credentials.email);
  await page.getByRole("button", { name: "Send Reset Link" }).click();

  await expect(page.getByRole("status")).toContainText(
    "If an account exists for that email, a password reset link has been sent."
  );
});

test("resets the password and rejects reuse of the same reset link", async ({ page }) => {
  const credentials = createTestCredentials("reset-complete");
  await ensureAccountExists(credentials);
  const resetToken = await createPasswordResetTokenForEmail(credentials.email);

  await page.goto(`/reset-password/${encodeURIComponent(resetToken)}`);
  await page.getByLabel("New Password").fill("new-password123");
  await page.getByRole("button", { name: "Update Password" }).click();

  await expect(page).toHaveURL(/\/login$/);

  await loginWithUi(page, {
    email: credentials.email,
    password: "new-password123"
  });
  await expect(page).toHaveURL(/\/portfolio$/);
  await signOutWithUi(page);

  await page.goto(`/reset-password/${encodeURIComponent(resetToken)}`);
  await expect(page.getByText("This password reset link is invalid or has expired.")).toBeVisible();
});
