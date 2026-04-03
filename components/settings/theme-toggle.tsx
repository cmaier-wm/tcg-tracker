"use client";

import React, { useEffect, useState } from "react";
import {
  applyThemeMode,
  defaultThemeMode,
  toggleThemeMode,
  type ThemeMode
} from "@/lib/settings/theme-preference";
import {
  readStoredThemeMode,
  writeStoredThemeMode
} from "@/lib/settings/theme-storage";

export function ThemeToggle() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(defaultThemeMode);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedTheme = readStoredThemeMode();
    setThemeMode(storedTheme);
    applyThemeMode(storedTheme);
    setIsHydrated(true);
  }, []);

  const isDarkMode = themeMode === "dark";

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
          disabled={!isHydrated}
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
      {!isHydrated ? <p className="muted">Loading saved preference...</p> : null}
    </div>
  );
}
