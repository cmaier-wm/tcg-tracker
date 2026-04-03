"use client";

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function HoldingForm({
  holdingId,
  quantity,
  cardName,
  variationLabel,
  compact = false
}: {
  holdingId: string;
  quantity: number;
  cardName?: string;
  variationLabel?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [nextQuantity, setNextQuantity] = useState(quantity);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function submit(method: "PATCH" | "DELETE") {
    setIsSaving(true);
    const response = await fetch(`/api/portfolio/${holdingId}`, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: method === "PATCH" ? JSON.stringify({ quantity: nextQuantity }) : undefined
    });

    if (response.ok) {
      setMessage(method === "DELETE" ? "Holding removed" : "Saved");
      router.refresh();
    } else {
      setMessage("Unable to update holding");
    }

    setIsSaving(false);
  }

  return (
    <div className={compact ? "holding-form compact" : "surface-card holding-form"}>
      {compact ? null : cardName || variationLabel ? (
        <div>
          <h3>{cardName ?? "Update a holding"}</h3>
          {variationLabel ? <p className="muted">{variationLabel}</p> : null}
        </div>
      ) : (
        <h3>Update a holding</h3>
      )}
      <div className={compact ? "holding-actions" : "form-grid"}>
        <label className="field">
          Quantity
          <input
            type="number"
            min={1}
            value={nextQuantity}
            disabled={isSaving}
            onChange={(event) => setNextQuantity(Number(event.target.value))}
          />
        </label>
        <div className="button-row">
          <button
            type="button"
            className="button"
            disabled={isSaving}
            onClick={() => submit("PATCH")}
          >
            {isSaving ? "Saving..." : "Update quantity"}
          </button>
          <button
            type="button"
            className="button secondary"
            disabled={isSaving}
            onClick={() => submit("DELETE")}
          >
            Remove holding
          </button>
        </div>
      </div>
      {message ? <p className="muted">{message}</p> : null}
    </div>
  );
}
