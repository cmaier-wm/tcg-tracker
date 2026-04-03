import React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/settings/theme-toggle";

export function SettingsPage() {
  return (
    <div className="page-grid">
      <section className="page-hero">
        <div className="stack">
          <p className="eyebrow">Preferences</p>
          <h1>Settings</h1>
          <p className="hero-copy">
            Choose the appearance you want for long browsing sessions.
          </p>
        </div>
      </section>
      <section className="surface-card stack">
        <div className="detail-back-row">
          <Link href="/" className="inline-link">
            Back to Browse
          </Link>
        </div>
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
