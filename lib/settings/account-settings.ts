import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAuthenticatedUser } from "@/lib/auth/auth-session";
import { withDatabaseFallback } from "@/lib/db/runtime";
import { getDemoUserState } from "@/lib/db/demo-store";

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

export async function getAccountSettings(userId?: string | null): Promise<AccountSettingsResponse> {
  if (!userId) {
    return { themeMode: defaultThemeMode };
  }

  return withDatabaseFallback(
    async () => {
      const settings = await prisma.accountSettings.findUnique({
        where: { userId },
        select: { themeMode: true }
      });

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
  return withDatabaseFallback(
    async () => {
      const user = await requireAuthenticatedUser();
      const settings = await prisma.accountSettings.upsert({
        where: { userId: user.userId },
        update: {
          themeMode: input.themeMode
        },
        create: {
          userId: user.userId,
          themeMode: input.themeMode
        }
      });

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
