"use client";

import React from "react";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

const quantityCelebrationDurationMs = 3000;

export function HoldingForm({
  holdingId,
  quantity,
  cardName,
  variationLabel,
  compact = false,
  onQuantityCelebration
}: {
  holdingId: string;
  quantity: number;
  cardName?: string;
  variationLabel?: string;
  compact?: boolean;
  onQuantityCelebration?: (payload: {
    holdingId: string;
    cardName?: string;
    quantity: number;
  }) => void;
}) {
  const router = useRouter();
  const [nextQuantity, setNextQuantity] = useState(quantity);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const lastSavedQuantityRef = useRef(quantity);

  const submitQuantity = useEffectEvent(async (quantityToSave: number) => {
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
      onQuantityCelebration?.({
        holdingId,
        cardName,
        quantity: quantityToSave
      });
      window.setTimeout(() => {
        router.refresh();
      }, quantityCelebrationDurationMs);
    } else if (response.status === 401) {
      setIsSaving(false);
      router.push(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`);
    } else {
      toast.error("Unable to complete action");
      setNextQuantity(lastSavedQuantityRef.current);
      setIsSaving(false);
    }
  });

  useEffect(() => {
    if (nextQuantity < 1 || nextQuantity === lastSavedQuantityRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void submitQuantity(nextQuantity);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [nextQuantity]);

  async function removeHolding() {
    setIsSaving(true);
    const response = await fetch(`/api/portfolio/${holdingId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      setIsConfirmingDelete(false);
      toast.success("Card removed from portfolio");
      router.refresh();
    } else if (response.status === 401) {
      setIsConfirmingDelete(false);
      router.push(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`);
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
            className="icon-button danger"
            disabled={isSaving}
            aria-label="Remove holding"
            title="Remove holding"
            onClick={() => setIsConfirmingDelete(true)}
          >
            <Trash2 aria-hidden="true" className="icon-button-glyph" strokeWidth={2} />
          </button>
        </div>
      </div>
      {isConfirmingDelete ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => {
            if (!isSaving) {
              setIsConfirmingDelete(false);
            }
          }}
        >
          <div
            className="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`delete-holding-title-${holdingId}`}
            aria-describedby={`delete-holding-copy-${holdingId}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="stack">
              <h3 id={`delete-holding-title-${holdingId}`}>Remove this holding?</h3>
              <p id={`delete-holding-copy-${holdingId}`} className="muted">
                {cardName
                  ? `Delete ${cardName} from your portfolio. This action cannot be undone.`
                  : "Delete this card from your portfolio. This action cannot be undone."}
              </p>
            </div>
            <div className="button-row confirm-dialog-actions">
              <button
                type="button"
                className="button secondary"
                disabled={isSaving}
                onClick={() => setIsConfirmingDelete(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button danger"
                disabled={isSaving}
                onClick={() => void removeHolding()}
              >
                Delete Holding
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
