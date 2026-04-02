import React from "react";
import { CardEmptyState } from "@/components/cards/card-empty-state";
import { PortfolioValueChart } from "@/components/charts/portfolio-value-chart";
import { HoldingForm } from "@/components/portfolio/holding-form";
import { PortfolioList } from "@/components/portfolio/portfolio-list";
import { toCurrency } from "@/lib/api/serializers";
import { getPortfolio } from "@/lib/portfolio/get-portfolio";
import { getPortfolioHistory } from "@/lib/portfolio/get-portfolio-history";

export default async function PortfolioPage() {
  const portfolio = await getPortfolio();
  const history = await getPortfolioHistory();

  return (
    <div className="page-grid">
      <section className="panel">
        <p className="eyebrow">Personal collection</p>
        <h1>Portfolio value</h1>
        <p className="muted">
          Current total estimated value: {toCurrency(portfolio.totalEstimatedValue)}
        </p>
      </section>
      <div className="grid-two">
        <section className="panel">
          <h2>Holdings</h2>
          {portfolio.holdings.length ? (
            <div className="stack">
              <PortfolioList holdings={portfolio.holdings} />
              <div className="grid-two">
                {portfolio.holdings.map((holding) => (
                  <HoldingForm
                    key={holding.id}
                    holdingId={holding.id}
                    quantity={holding.quantity}
                  />
                ))}
              </div>
            </div>
          ) : (
            <CardEmptyState
              title="No holdings yet"
              body="Add a card variation from a detail page to start tracking your collection."
            />
          )}
        </section>
        <div className="stack">
          <section className="panel">
            <h2>Portfolio history</h2>
            {history.points.length > 1 ? (
              <PortfolioValueChart points={history.points} />
            ) : (
              <CardEmptyState
                title="No portfolio history yet"
                body="Portfolio history appears after repeated valuation snapshots have been saved."
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
