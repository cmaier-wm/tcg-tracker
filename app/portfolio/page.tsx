import React from "react";
import { CardEmptyState } from "@/components/cards/card-empty-state";
import { PortfolioValueChart } from "@/components/charts/portfolio-value-chart";
import { PortfolioList } from "@/components/portfolio/portfolio-list";
import { PortfolioPagination } from "@/components/portfolio/portfolio-pagination";
import { PortfolioSort } from "@/components/portfolio/portfolio-sort";
import { toCurrency, toSignedCurrency } from "@/lib/api/serializers";
import { requirePageAuth } from "@/lib/auth/route-guards";
import { calculateTodayProfitLoss } from "@/lib/portfolio/calculate-today-profit-loss";
import { getPortfolio } from "@/lib/portfolio/get-portfolio";
import { getPortfolioHistory } from "@/lib/portfolio/get-portfolio-history";
import { normalizePortfolioSort } from "@/lib/portfolio/portfolio-sort";

export default async function PortfolioPage({
  searchParams
}: {
  searchParams?: Promise<{ sort?: string; page?: string }>;
}) {
  await requirePageAuth("/portfolio");
  const params = searchParams ? await searchParams : {};
  const selectedSort = normalizePortfolioSort(params.sort);
  const portfolio = await getPortfolio({ sort: selectedSort, page: params.page });
  const history = await getPortfolioHistory();
  const todayProfitLoss = calculateTodayProfitLoss(
    history.points.map((point) => ({
      capturedAt: point.capturedAt,
      totalValue: point.totalValue
    }))
  );
  const totalCards = portfolio.holdings.reduce((sum, holding) => sum + holding.quantity, 0);
  const todayProfitLossClass =
    todayProfitLoss > 0
      ? "stat-value-positive"
      : todayProfitLoss < 0
        ? "stat-value-negative"
        : "stat-value-neutral";

  return (
    <div className="page-grid">
      <section className="page-intro stack">
        <div className="stack">
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
          <p className="eyebrow">Profit / loss</p>
          <h2 className={todayProfitLossClass}>{toSignedCurrency(todayProfitLoss)}</h2>
          <p className="muted">Compared with your first valuation snapshot today.</p>
        </article>
        <article className="stat-card">
          <p className="eyebrow">Total cards</p>
          <h2>{totalCards}</h2>
          <p className="muted">{portfolio.holdingCount} unique tracked entries.</p>
        </article>
      </section>
      <div className="dashboard-grid">
        <section className="surface-card">
          <div className="section-heading">
            <div>
              <h2>Your Cards</h2>
              <p className="muted">Manage tracked cards and estimated values.</p>
            </div>
            {portfolio.holdings.length ? <PortfolioSort selectedSort={selectedSort} /> : null}
          </div>
          {portfolio.holdings.length ? (
            <>
              <PortfolioList holdings={portfolio.holdings} />
              <PortfolioPagination
                page={portfolio.page}
                totalPages={portfolio.totalPages}
                sort={selectedSort}
              />
            </>
          ) : (
            <CardEmptyState
              title="Your portfolio is empty"
              body="Add a card from a detail page to start tracking your collection."
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
