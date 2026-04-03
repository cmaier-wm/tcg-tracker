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

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    writeStoredThemeMode(themeMode);
    applyThemeMode(themeMode);
  }, [isHydrated, themeMode]);

  const isDarkMode = themeMode === "dark";

  return (
    <div className="theme-toggle-card">
      <div className="theme-toggle-copy">
        <h3>Dark mode</h3>
        <p className="muted">Use a darker color palette for low-light browsing.</p>
      </div>
      <label className={isDarkMode ? "theme-toggle-switch active" : "theme-toggle-switch"}>
        <span className="theme-toggle-switch-label">Dark mode</span>
        <span className="theme-toggle-switch-state">{isDarkMode ? "On" : "Off"}</span>
        <input
          type="checkbox"
          checked={isDarkMode}
          aria-label="Dark mode toggle"
          disabled={!isHydrated}
          onChange={() => setThemeMode(toggleThemeMode(themeMode))}
        />
        <span className="theme-toggle-switch-track" aria-hidden="true">
          <span className="theme-toggle-switch-thumb" />
        </span>
      </label>
      {!isHydrated ? <p className="muted">Loading saved preference...</p> : null}
    </div>
  );
}
