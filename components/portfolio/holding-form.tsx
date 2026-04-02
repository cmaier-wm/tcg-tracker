"use client";

import React from "react";
import { useState } from "react";

export function HoldingForm({
  holdingId,
  quantity
}: {
  holdingId: string;
  quantity: number;
}) {
  const [nextQuantity, setNextQuantity] = useState(quantity);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(method: "PATCH" | "DELETE") {
    const response = await fetch(`/api/portfolio/${holdingId}`, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: method === "PATCH" ? JSON.stringify({ quantity: nextQuantity }) : undefined
    });

    setMessage(response.ok ? "Saved" : "Unable to update holding");
  }

  return (
    <div className="panel form-grid">
      <h3>Update a holding</h3>
      <label className="field">
        Quantity
        <input
          type="number"
          min={1}
          value={nextQuantity}
          onChange={(event) => setNextQuantity(Number(event.target.value))}
        />
      </label>
      <div className="button-row">
        <button type="button" className="button" onClick={() => submit("PATCH")}>
          Update quantity
        </button>
        <button
          type="button"
          className="button secondary"
          onClick={() => submit("DELETE")}
        >
          Remove holding
        </button>
      </div>
      {message ? <p className="muted">{message}</p> : null}
    </div>
  );
}
