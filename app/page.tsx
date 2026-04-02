import React from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="page-grid">
      <section className="hero">
        <article className="panel hero-card">
          <p className="hero-kicker">Collector dashboard</p>
          <h1 className="hero-title">Track cards, variants, and portfolio value.</h1>
          <p className="hero-copy">
            Browse TCG cards across supported games, inspect price movement, and keep
            a running view of how your collection is performing.
          </p>
          <div className="button-row">
            <Link href="/cards" className="button">
              Browse cards
            </Link>
            <Link href="/portfolio" className="button secondary">
              View portfolio
            </Link>
          </div>
        </article>
        <aside className="panel hero-card">
          <h2>What ships first</h2>
          <div className="stack muted">
            <p>Variant-aware catalog pages with card images and detail views.</p>
            <p>Current pricing and historical price graphs for tracked variants.</p>
            <p>Portfolio holdings, current total value, and valuation history.</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
