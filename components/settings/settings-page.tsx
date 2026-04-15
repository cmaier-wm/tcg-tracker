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
            <p className="muted">Control how the app looks across your account.</p>
          </div>
        </div>
        {isAuthenticated ? (
          <ThemeToggle initialThemeMode={initialThemeMode} />
        ) : (
          <div className="stack">
            <p className="muted">
              Sign in to manage your account-backed appearance preferences.
            </p>
            <div className="button-row">
              <Link href="/login" className="button secondary">
                Sign In To Manage Appearance
              </Link>
            </div>
          </div>
        )}
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
              Sign in to manage your account-backed Teams alert settings.
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
