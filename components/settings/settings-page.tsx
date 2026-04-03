import React from "react";
import { ThemeToggle } from "@/components/settings/theme-toggle";

export function SettingsPage() {
  return (
    <div className="page-grid">
      <section className="page-intro stack">
        <div className="stack">
          <h1>Settings</h1>
          <p className="hero-copy">
            Choose the appearance you want for long browsing sessions and keep it applied
            everywhere in the app.
          </p>
        </div>
      </section>
      <section className="surface-card stack">
        <div className="section-heading">
          <div>
            <h2>Appearance</h2>
            <p className="muted">Control how the app looks on this browser and device.</p>
          </div>
        </div>
        <ThemeToggle />
      </section>
    </div>
  );
}
