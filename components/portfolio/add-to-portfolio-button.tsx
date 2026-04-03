"use client";

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function AddToPortfolioButton({
  variationId,
  variationLabel
}: {
  variationId: string;
  variationLabel: string;
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    const response = await fetch("/api/portfolio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ cardVariationId: variationId, quantity })
    });

    if (response.ok) {
      toast.success("Card added to portfolio");
      router.push("/portfolio");
      router.refresh();
    } else {
      toast.error("Unable to complete action");
    }

    setIsSaving(false);
  }

  return (
    <form className="holding-form form-grid" onSubmit={onSubmit}>
      <h3>Add to portfolio</h3>
      <p className="muted">{variationLabel}</p>
      <label className="field">
        Quantity
        <input
          type="number"
          min={1}
          value={quantity}
          disabled={isSaving}
          onChange={(event) => setQuantity(Number(event.target.value))}
        />
      </label>
      <button className="button" type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save holding"}
      </button>
    </form>
  );
}
