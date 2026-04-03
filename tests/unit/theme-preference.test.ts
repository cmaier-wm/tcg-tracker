import { afterEach, describe, expect, it } from "vitest";
import {
  defaultThemeMode,
  normalizeThemeMode,
  toggleThemeMode
} from "@/lib/settings/theme-preference";
import {
  clearStoredThemeMode,
  readStoredThemeMode,
  writeStoredThemeMode
} from "@/lib/settings/theme-storage";

afterEach(() => {
  clearStoredThemeMode();
  document.documentElement.dataset.theme = "";
  document.documentElement.style.colorScheme = "";
});

describe("theme preference helpers", () => {
  it("normalizes invalid values to the default theme", () => {
    expect(normalizeThemeMode(undefined)).toBe(defaultThemeMode);
    expect(normalizeThemeMode("invalid")).toBe(defaultThemeMode);
    expect(normalizeThemeMode("dark")).toBe("dark");
  });

  it("toggles between light and dark", () => {
    expect(toggleThemeMode("light")).toBe("dark");
    expect(toggleThemeMode("dark")).toBe("light");
  });

  it("reads and writes the stored preference", () => {
    writeStoredThemeMode("dark");

    expect(readStoredThemeMode()).toBe("dark");
  });
});
