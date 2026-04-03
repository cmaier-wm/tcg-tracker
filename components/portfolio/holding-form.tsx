"use client";

import React from "react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
  const [isSaving, setIsSaving] = useState(false);
  const lastSavedQuantityRef = useRef(quantity);

  useEffect(() => {
    setNextQuantity(quantity);
    lastSavedQuantityRef.current = quantity;
  }, [quantity]);

  useEffect(() => {
    if (nextQuantity < 1 || nextQuantity === lastSavedQuantityRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void submitQuantity(nextQuantity);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [nextQuantity]);

  async function submitQuantity(quantityToSave: number) {
    setIsSaving(true);
    const response = await fetch(`/api/portfolio/${holdingId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ quantity: quantityToSave })
    });

    if (response.ok) {
      lastSavedQuantityRef.current = quantityToSave;
      toast.success("Quantity updated");
      router.refresh();
    } else {
      toast.error("Unable to complete action");
      setNextQuantity(lastSavedQuantityRef.current);
    }

    setIsSaving(false);
  }

  async function removeHolding() {
    setIsSaving(true);
    const response = await fetch(`/api/portfolio/${holdingId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      toast.success("Card removed from portfolio");
      router.refresh();
    } else {
      toast.error("Unable to complete action");
      setIsSaving(false);
    }
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
            onChange={(event) => {
              const value = Number(event.target.value);

              if (Number.isNaN(value)) {
                return;
              }

              setNextQuantity(value);
            }}
          />
        </label>
        <div className="button-row">
          <button
            type="button"
            className="button secondary"
            disabled={isSaving}
            onClick={() => void removeHolding()}
          >
            Remove holding
          </button>
        </div>
      </div>
    </div>
  );
}
