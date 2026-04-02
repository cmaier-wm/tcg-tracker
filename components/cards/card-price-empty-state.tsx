import React from "react";

export function CardPriceEmptyState({ body }: { body: string }) {
  return (
    <div className="empty-state">
      <h3>Price history unavailable</h3>
      <p className="muted">{body}</p>
    </div>
  );
}
