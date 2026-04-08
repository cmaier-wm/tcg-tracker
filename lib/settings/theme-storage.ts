import { defaultThemeMode, isThemeMode, type ThemeMode } from "@/lib/settings/theme-preference";

export const themeStorageKey = "tcg-tracker-theme";
export const themeCookieName = "tcg-tracker-theme";
const memoryStorage = new Map<string, string>();

function getThemeStorage() {
  if (
    typeof window !== "undefined" &&
    window.localStorage &&
    typeof window.localStorage.getItem === "function" &&
    typeof window.localStorage.setItem === "function" &&
    typeof window.localStorage.removeItem === "function"
  ) {
    return window.localStorage;
  }

  return {
    getItem: (key: string) => memoryStorage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memoryStorage.set(key, value);
    },
    removeItem: (key: string) => {
      memoryStorage.delete(key);
    }
  };
}

export function readStoredThemeMode(): ThemeMode {
  const storedValue = getThemeStorage().getItem(themeStorageKey);
  return isThemeMode(storedValue) ? storedValue : defaultThemeMode;
}

export function readStoredThemeModeSnapshot(): ThemeMode | null {
  const storedValue = getThemeStorage().getItem(themeStorageKey);
  return isThemeMode(storedValue) ? storedValue : null;
}

export function writeStoredThemeMode(mode: ThemeMode) {
  getThemeStorage().setItem(themeStorageKey, mode);

  if (typeof document !== "undefined") {
    document.cookie = `${themeCookieName}=${mode}; path=/; max-age=31536000; samesite=lax`;
  }
}

export function clearStoredThemeMode() {
  getThemeStorage().removeItem(themeStorageKey);

  if (typeof document !== "undefined") {
    document.cookie = `${themeCookieName}=; path=/; max-age=0; samesite=lax`;
  }
}
