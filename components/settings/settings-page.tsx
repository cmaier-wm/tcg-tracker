import React from "react";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { TeamsAlertSettings } from "@/components/settings/teams-alert-settings";

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
      <section className="surface-card stack">
        <div className="section-heading">
          <div>
            <h2>Alerts</h2>
            <p className="muted">
              Configure outbound notifications when your portfolio value makes a meaningful
              jump.
            </p>
          </div>
        </div>
        <TeamsAlertSettings />
      </section>
    </div>
  );
}
