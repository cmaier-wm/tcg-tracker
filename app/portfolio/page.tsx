import React from "react";
import { CardEmptyState } from "@/components/cards/card-empty-state";
import { PortfolioValueChart } from "@/components/charts/portfolio-value-chart";
import { PortfolioList } from "@/components/portfolio/portfolio-list";
import { toCurrency } from "@/lib/api/serializers";
import { getPortfolio } from "@/lib/portfolio/get-portfolio";
import { getPortfolioHistory } from "@/lib/portfolio/get-portfolio-history";

export default async function PortfolioPage() {
  const portfolio = await getPortfolio();
  const history = await getPortfolioHistory();
  const totalCards = portfolio.holdings.reduce((sum, holding) => sum + holding.quantity, 0);

  return (
    <div className="page-grid">
      <section className="page-hero">
        <div className="stack">
          <p className="eyebrow">Personal collection</p>
          <h1>My Portfolio</h1>
          <p className="hero-copy">
            Track your collection value over time and update holdings without leaving the
            dashboard.
          </p>
        </div>
      </section>
      <section className="stats-grid">
        <article className="stat-card">
          <p className="eyebrow">Total value</p>
          <h2>{toCurrency(portfolio.totalEstimatedValue)}</h2>
          <p className="muted">Live estimate across all saved holdings.</p>
        </article>
        <article className="stat-card">
          <p className="eyebrow">Total cards</p>
          <h2>{totalCards}</h2>
          <p className="muted">{portfolio.holdingCount} unique tracked entries.</p>
        </article>
        <article className="stat-card">
          <p className="eyebrow">Portfolio status</p>
          <h2>{portfolio.holdings.length ? "Active" : "Empty"}</h2>
          <p className="muted">Update quantity or remove holdings inline below.</p>
        </article>
      </section>
      <div className="dashboard-grid">
        <section className="surface-card">
          <div className="section-heading">
            <div>
              <h2>Your Cards</h2>
              <p className="muted">Manage tracked variations and estimated values.</p>
            </div>
          </div>
          {portfolio.holdings.length ? (
            <PortfolioList holdings={portfolio.holdings} />
          ) : (
            <CardEmptyState
              title="Your portfolio is empty"
              body="Add a card variation from a detail page to start tracking your collection."
            />
          )}
        </section>
        <section className="surface-card">
          <div className="section-heading">
            <div>
              <h2>Portfolio Value History</h2>
              <p className="muted">Recent valuation snapshots for your collection.</p>
            </div>
          </div>
          <div className="chart-panel">
            {history.points.length > 1 ? (
              <PortfolioValueChart points={history.points} />
            ) : (
              <CardEmptyState
                title="No portfolio history yet"
                body="Portfolio history appears after repeated valuation snapshots have been saved."
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
