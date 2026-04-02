"use client";

import React from "react";
import { useState } from "react";

export function AddToPortfolioButton({
  variationId
}: {
  variationId: string;
}) {
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Saving...");

    const response = await fetch("/api/portfolio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ cardVariationId: variationId, quantity })
    });

    setStatus(response.ok ? "Added to portfolio" : "Unable to save holding");
  }

  return (
    <form className="panel form-grid" onSubmit={onSubmit}>
      <h3>Add to portfolio</h3>
      <label className="field">
        Quantity
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
        />
      </label>
      <button className="button" type="submit">
        Save holding
      </button>
      {status ? <p className="muted">{status}</p> : null}
    </form>
  );
}
