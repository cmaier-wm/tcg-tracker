import { demoCards } from "@/lib/db/demo-data";

export async function syncPriceSnapshots() {
  return {
    snapshots: demoCards.flatMap((card) => card.variations.flatMap((variation) => variation.history)).length,
    capturedAt: new Date().toISOString()
  };
}

