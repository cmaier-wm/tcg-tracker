import React from "react";
import Link from "next/link";
import { CardDetail } from "@/components/cards/card-detail";
import { CardPriceEmptyState } from "@/components/cards/card-price-empty-state";
import { CardPriceSummary } from "@/components/cards/card-price-summary";
import { PriceHistoryChart } from "@/components/charts/price-history-chart";
import { AddToPortfolioButton } from "@/components/portfolio/add-to-portfolio-button";
import { getPriceHistory } from "@/lib/pricing/get-price-history";
import { getCardDetail } from "@/lib/tcgtracking/get-card-detail";
import { selectPreferredVariation } from "@/lib/tcgtracking/select-preferred-variation";

export default async function CardDetailPage({
  params
}: {
  params: Promise<{ category: string; cardId: string }>;
}) {
  const resolvedParams = await params;
  const card = await getCardDetail(resolvedParams.category, resolvedParams.cardId);
  const selectedVariation = selectPreferredVariation(card.variations);
  const history = selectedVariation ? await getPriceHistory(selectedVariation.id) : { points: [] };

  return (
    <div className="page-grid">
      <section className="detail-back-row">
        <Link href="/cards" className="inline-link">
          Back to Browse
        </Link>
      </section>
      <CardDetail card={card} selectedVariationId={selectedVariation?.id} />
      <div className="dashboard-grid">
        <section className="surface-card stack">
          <CardPriceSummary
            currentPrice={selectedVariation?.currentPrice}
            lastUpdatedAt={selectedVariation?.lastUpdatedAt}
          />
          <div className="chart-panel">
            <h2>Price History</h2>
            {history.points.length > 1 ? (
              <PriceHistoryChart points={history.points} />
            ) : (
              <CardPriceEmptyState body="Historical pricing will appear after more than one price snapshot has been recorded." />
            )}
          </div>
        </section>
        <section className="surface-card stack">
          <div className="section-heading">
            <div>
              <h2>Add to Portfolio</h2>
              <p className="muted">Save this English card to your tracked holdings.</p>
            </div>
          </div>
          {selectedVariation ? (
            <AddToPortfolioButton
              variationId={selectedVariation.id}
              variationLabel="English"
            />
          ) : null}
        </section>
      </div>
    </div>
  );
}
