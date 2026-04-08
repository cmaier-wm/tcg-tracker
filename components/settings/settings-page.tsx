import React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { TeamsAlertSettings } from "@/components/settings/teams-alert-settings";
import type { ThemeMode } from "@/lib/settings/theme-preference";

type SettingsPageProps = {
  initialThemeMode: ThemeMode;
  isAuthenticated: boolean;
};

export function SettingsPage({ initialThemeMode, isAuthenticated }: SettingsPageProps) {
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
        <ThemeToggle initialThemeMode={initialThemeMode} />
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
        {isAuthenticated ? (
          <TeamsAlertSettings />
        ) : (
          <div className="stack">
            <p className="muted">
              Sign in to manage account-backed Teams alerts. Theme preferences stay
              available on this device even when signed out.
            </p>
            <div className="button-row">
              <Link href="/login" className="button secondary">
                Sign In To Manage Alerts
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
