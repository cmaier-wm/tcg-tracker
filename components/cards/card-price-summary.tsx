import React from "react";
import { toCurrency } from "@/lib/api/serializers";

export function CardPriceSummary({
  currentPrice,
  lastUpdatedAt
}: {
  currentPrice?: number | null;
  lastUpdatedAt?: string | null;
}) {
  if (currentPrice == null) {
    return (
      <div className="empty-state">
        <h3>No current price</h3>
        <p className="muted">Current pricing has not been recorded for this variation yet.</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <p className="eyebrow">Current price</p>
      <h2>{toCurrency(currentPrice)}</h2>
      <p className="muted">
        Last updated {lastUpdatedAt ? new Date(lastUpdatedAt).toLocaleString() : "unknown"}
      </p>
    </div>
  );
}
