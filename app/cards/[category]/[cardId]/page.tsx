import React from "react";
import { CardDetail } from "@/components/cards/card-detail";
import { CardPriceEmptyState } from "@/components/cards/card-price-empty-state";
import { CardPriceSummary } from "@/components/cards/card-price-summary";
import { PriceHistoryChart } from "@/components/charts/price-history-chart";
import { AddToPortfolioButton } from "@/components/portfolio/add-to-portfolio-button";
import { getPriceHistory } from "@/lib/pricing/get-price-history";
import { getCardDetail } from "@/lib/tcgtracking/get-card-detail";

export default async function CardDetailPage({
  params
}: {
  params: Promise<{ category: string; cardId: string }>;
}) {
  const resolvedParams = await params;
  const card = await getCardDetail(resolvedParams.category, resolvedParams.cardId);
  const selectedVariation = card.variations[0];
  const history = selectedVariation ? await getPriceHistory(selectedVariation.id) : { points: [] };

  return (
    <div className="page-grid">
      <CardDetail card={card} selectedVariationId={selectedVariation?.id} />
      <div className="grid-two">
        <div className="stack">
          <CardPriceSummary
            currentPrice={selectedVariation?.currentPrice}
            lastUpdatedAt={selectedVariation?.lastUpdatedAt}
          />
          <section className="panel">
            <h2>Price history</h2>
            {history.points.length > 1 ? (
              <PriceHistoryChart points={history.points} />
            ) : (
              <CardPriceEmptyState body="Historical pricing will appear after more than one price snapshot has been recorded." />
            )}
          </section>
        </div>
        <div className="stack">
          {selectedVariation ? <AddToPortfolioButton variationId={selectedVariation.id} /> : null}
        </div>
      </div>
    </div>
  );
}
