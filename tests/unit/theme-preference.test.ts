import { afterEach, describe, expect, it } from "vitest";
import { applyThemeMode, defaultThemeMode, normalizeThemeMode, toggleThemeMode } from "@/lib/settings/theme-preference";

afterEach(() => {
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

  it("applies the theme mode to the document", () => {
    applyThemeMode("dark");

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });
});
