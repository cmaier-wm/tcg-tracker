import { expect, type Page } from "@playwright/test";

export function createTestCredentials(prefix: string) {
  const id = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    email: `${id}@example.com`,
    password: "password123"
  };
}

export async function registerWithUi(
  page: Page,
  credentials: { email: string; password: string },
  options?: { returnTo?: string }
) {
  const search = options?.returnTo
    ? `?returnTo=${encodeURIComponent(options.returnTo)}`
    : "";

  await page.goto(`/register${search}`);
  await page.getByLabel("Email").fill(credentials.email);
  await page.getByLabel("Password").fill(credentials.password);
  await page.getByRole("button", { name: "Create Account" }).click();
  await page.waitForURL(/\/(portfolio|settings|cards(?:\/.*)?)$/);
}

export async function loginWithUi(
  page: Page,
  credentials: { email: string; password: string },
  options?: { returnTo?: string }
) {
  const search = options?.returnTo
    ? `?returnTo=${encodeURIComponent(options.returnTo)}`
    : "";

  await page.goto(`/login${search}`);
  await page.getByLabel("Email").fill(credentials.email);
  await page.getByLabel("Password").fill(credentials.password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/(portfolio|settings|cards(?:\/.*)?)$/);
}

export async function signOutWithUi(page: Page) {
  await page.getByRole("button", { name: "Sign Out" }).click();
  await expect(page).toHaveURL(/\/login$/);
}
