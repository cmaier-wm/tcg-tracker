"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { applyThemeMode, toggleThemeMode, type ThemeMode } from "@/lib/settings/theme-preference";

type ThemeToggleProps = {
  initialThemeMode: ThemeMode;
};

export function ThemeToggle({ initialThemeMode }: ThemeToggleProps) {
  const router = useRouter();
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialThemeMode);
  const [isSaving, setIsSaving] = useState(false);

  const isDarkMode = themeMode === "dark";

  useEffect(() => {
    applyThemeMode(themeMode);
  }, [themeMode]);

  async function handleThemeChange() {
    const previousThemeMode = themeMode;
    const nextThemeMode = toggleThemeMode(themeMode);

    setThemeMode(nextThemeMode);
    setIsSaving(true);

    const response = await fetch("/api/settings/account", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ themeMode: nextThemeMode })
    });

    setIsSaving(false);

    if (!response.ok) {
      setThemeMode(previousThemeMode);
      toast.error("Unable to save appearance settings.");
      return;
    }

    router.refresh();
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
          disabled={isSaving}
          onChange={() => void handleThemeChange()}
        />
        <span className="theme-toggle-switch-track" aria-hidden="true">
          <span className="theme-toggle-switch-track-label">☼</span>
          <span className="theme-toggle-switch-thumb" />
          <span className="theme-toggle-switch-track-label">☾</span>
        </span>
        <span className="theme-toggle-switch-copy">
          <span className="theme-toggle-switch-label">Dark mode</span>
          <span className="theme-toggle-switch-state">
            {isSaving ? "Saving..." : isDarkMode ? "Enabled" : "Disabled"}
          </span>
        </span>
      </label>
    </div>
  );
}
