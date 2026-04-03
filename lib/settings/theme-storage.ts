import { defaultThemeMode, isThemeMode, type ThemeMode } from "@/lib/settings/theme-preference";

export const themeStorageKey = "tcg-tracker-theme";
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

export function writeStoredThemeMode(mode: ThemeMode) {
  getThemeStorage().setItem(themeStorageKey, mode);
}

export function clearStoredThemeMode() {
  getThemeStorage().removeItem(themeStorageKey);
}
