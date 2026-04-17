import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAuthenticatedUser } from "@/lib/auth/auth-session";
import { withDatabaseFallback } from "@/lib/db/runtime";
import { getDemoUserState } from "@/lib/db/demo-store";
import { getThemeModeCookie, setThemeModeCookie } from "@/lib/settings/theme-cookie";

export const accountThemeModeSchema = z.enum(["light", "dark"]);
export type AccountThemeMode = z.infer<typeof accountThemeModeSchema>;

export const accountSettingsPayloadSchema = z.object({
  themeMode: accountThemeModeSchema
});

export type AccountSettingsPayload = z.infer<typeof accountSettingsPayloadSchema>;
export type AccountSettingsResponse = {
  themeMode: AccountThemeMode;
};

const defaultThemeMode: AccountThemeMode = "dark";

function isRecoverableAccountSettingsStorageError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === "P2021" || error.code === "P2022";
  }

  return (
    error instanceof Error &&
    /AccountSettings|themeMode/i.test(error.message) &&
    /does not exist|unknown column|missing|invalid .* invocation/i.test(error.message)
  );
}

export async function getAccountSettings(userId?: string | null): Promise<AccountSettingsResponse> {
  if (!userId) {
    return { themeMode: await getThemeModeCookie() };
  }

  return withDatabaseFallback(
    async () => {
      let settings: { themeMode: string } | null;

      try {
        settings = await prisma.accountSettings.findUnique({
          where: { userId },
          select: { themeMode: true }
        });
      } catch (error) {
        if (!isRecoverableAccountSettingsStorageError(error)) {
          throw error;
        }

        return { themeMode: await getThemeModeCookie() };
      }

      return {
        themeMode: accountThemeModeSchema.parse(settings?.themeMode ?? defaultThemeMode)
      };
    },
    async () => ({
      themeMode: getDemoUserState(userId).themeMode ?? defaultThemeMode
    })
  );
}

export async function updateAccountSettings(input: AccountSettingsPayload): Promise<AccountSettingsResponse> {
  await setThemeModeCookie(input.themeMode);

  return withDatabaseFallback(
    async () => {
      const user = await requireAuthenticatedUser();
      let settings: { themeMode: string };

      try {
        settings = await prisma.accountSettings.upsert({
          where: { userId: user.userId },
          update: {
            themeMode: input.themeMode
          },
          create: {
            userId: user.userId,
            themeMode: input.themeMode
          }
        });
      } catch (error) {
        if (!isRecoverableAccountSettingsStorageError(error)) {
          throw error;
        }

        return { themeMode: input.themeMode };
      }

      return {
        themeMode: accountThemeModeSchema.parse(settings.themeMode)
      };
    },
    async () => {
      const user = await requireAuthenticatedUser();
      const state = getDemoUserState(user.userId);
      state.themeMode = input.themeMode;
      return { themeMode: state.themeMode };
    }
  );
}
