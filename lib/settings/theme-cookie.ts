import { cookies } from "next/headers";
import { getAuthCookieSecure } from "@/lib/auth/auth-config";
import { normalizeThemeMode, type ThemeMode } from "@/lib/settings/theme-preference";

export const THEME_MODE_COOKIE_NAME = "tcg-tracker.theme-mode";
const THEME_MODE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export async function getThemeModeCookie() {
  try {
    const cookieStore = await cookies();
    return normalizeThemeMode(cookieStore.get(THEME_MODE_COOKIE_NAME)?.value ?? null);
  } catch {
    return normalizeThemeMode(null);
  }
}

export async function setThemeModeCookie(themeMode: ThemeMode) {
  try {
    const cookieStore = await cookies();
    cookieStore.set(THEME_MODE_COOKIE_NAME, themeMode, {
      httpOnly: true,
      sameSite: "lax",
      secure: getAuthCookieSecure(),
      path: "/",
      maxAge: THEME_MODE_COOKIE_MAX_AGE_SECONDS
    });
  } catch {
    return;
  }
}
