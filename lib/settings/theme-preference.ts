export type ThemeMode = "light" | "dark";

export const defaultThemeMode: ThemeMode = "light";

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark";
}

export function normalizeThemeMode(value?: string | null): ThemeMode {
  return isThemeMode(value) ? value : defaultThemeMode;
}

export function toggleThemeMode(mode: ThemeMode): ThemeMode {
  return mode === "dark" ? "light" : "dark";
}

export function applyThemeMode(mode: ThemeMode) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.theme = mode;
  document.documentElement.style.colorScheme = mode;
}
