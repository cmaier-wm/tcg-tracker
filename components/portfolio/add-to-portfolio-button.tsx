"use client";

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoadingLabel } from "@/components/ui/loading-label";

export function AddToPortfolioButton({
  variationId
}: {
  variationId: string;
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
    } else if (response.status === 401) {
      router.push(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`);
    } else {
      toast.error("Unable to complete action");
    }

    setIsSaving(false);
  }

  return (
    <form className="holding-form form-grid" onSubmit={onSubmit}>
      <h3>Add to portfolio</h3>
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
        <LoadingLabel isLoading={isSaving} label="Save Holding" loadingLabel="Saving holding" />
      </button>
    </form>
  );
}
