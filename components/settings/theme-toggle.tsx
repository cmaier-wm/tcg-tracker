"use client";

import React, { useEffect, useState } from "react";
import {
  applyThemeMode,
  toggleThemeMode,
  type ThemeMode
} from "@/lib/settings/theme-preference";
import {
  readStoredThemeModeSnapshot,
  writeStoredThemeMode
} from "@/lib/settings/theme-storage";

type ThemeToggleProps = {
  initialThemeMode: ThemeMode;
};

export function ThemeToggle({ initialThemeMode }: ThemeToggleProps) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const storedThemeMode = readStoredThemeModeSnapshot();
    return storedThemeMode ?? initialThemeMode;
  });

  const isDarkMode = themeMode === "dark";

  useEffect(() => {
    applyThemeMode(themeMode);
    const storedThemeMode = readStoredThemeModeSnapshot();

    if (storedThemeMode === null) {
      writeStoredThemeMode(themeMode);
    }
  }, [themeMode]);

  function handleThemeChange() {
    const nextThemeMode = toggleThemeMode(themeMode);
    writeStoredThemeMode(nextThemeMode);
    applyThemeMode(nextThemeMode);
    setThemeMode(nextThemeMode);
  }

  return (
    <div className="theme-toggle-card">
      <div className="theme-toggle-copy">
        <p className="eyebrow">Theme</p>
        <h3>Dark mode</h3>
        <p className="muted">
          Switch to a deeper low-light palette with brighter accent color and stronger
          contrast across the app.
        </p>
      </div>
      <label className={isDarkMode ? "theme-toggle-switch active" : "theme-toggle-switch"}>
        <input
          type="checkbox"
          checked={isDarkMode}
          aria-label="Dark mode toggle"
          onChange={handleThemeChange}
        />
        <span className="theme-toggle-switch-track" aria-hidden="true">
          <span className="theme-toggle-switch-track-label">☼</span>
          <span className="theme-toggle-switch-thumb" />
          <span className="theme-toggle-switch-track-label">☾</span>
        </span>
        <span className="theme-toggle-switch-copy">
          <span className="theme-toggle-switch-label">Dark mode</span>
          <span className="theme-toggle-switch-state">
            {isDarkMode ? "Enabled" : "Disabled"}
          </span>
        </span>
      </label>
    </div>
  );
}
