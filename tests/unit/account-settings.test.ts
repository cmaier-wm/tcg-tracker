import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { getAccountSettings, updateAccountSettings } from "@/lib/settings/account-settings";
import { setTestAuthenticatedUser } from "@/lib/auth/auth-session";

describe("account settings storage fallback", () => {
  beforeEach(() => {
    setTestAuthenticatedUser({
      userId: "user-1",
      email: "collector@example.com",
      displayName: "Collector"
    });
  });

  it("falls back to the cookie theme when account settings storage is unavailable", async () => {
    const findUniqueSpy = vi
      .spyOn(prisma.accountSettings, "findUnique")
      .mockRejectedValueOnce(
        new Error('The table `public.AccountSettings` does not exist in the current database.')
      );

    await expect(getAccountSettings("user-1")).resolves.toEqual({
      themeMode: "dark"
    });

    findUniqueSpy.mockRestore();
  });

  it("returns the requested theme when account settings writes cannot persist yet", async () => {
    const upsertSpy = vi
      .spyOn(prisma.accountSettings, "upsert")
      .mockRejectedValueOnce(
        new Error('The column `themeMode` does not exist in the current database.')
      );

    await expect(updateAccountSettings({ themeMode: "light" })).resolves.toEqual({
      themeMode: "light"
    });

    upsertSpy.mockRestore();
  });
});
