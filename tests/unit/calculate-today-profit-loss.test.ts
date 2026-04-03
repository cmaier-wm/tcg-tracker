import { describe, expect, it } from "vitest";
import { calculateTodayProfitLoss } from "@/lib/portfolio/calculate-today-profit-loss";

describe("calculateTodayProfitLoss", () => {
  it("returns the change across the latest day in the history", () => {
    const delta = calculateTodayProfitLoss([
      { capturedAt: "2026-04-02T08:00:00.000Z", totalValue: 78.8 },
      { capturedAt: "2026-04-03T08:00:00.000Z", totalValue: 81.1 },
      { capturedAt: "2026-04-03T16:00:00.000Z", totalValue: 86.9 }
    ]);

    expect(delta).toBeCloseTo(5.8, 5);
  });

  it("returns zero when there is only one point for the latest day", () => {
    const delta = calculateTodayProfitLoss([
      { capturedAt: "2026-04-02T08:00:00.000Z", totalValue: 78.8 },
      { capturedAt: "2026-04-03T08:00:00.000Z", totalValue: 81.1 }
    ]);

    expect(delta).toBe(0);
  });

  it("sorts unsorted points before comparing the latest day", () => {
    const delta = calculateTodayProfitLoss([
      { capturedAt: "2026-04-03T16:00:00.000Z", totalValue: 86.9 },
      { capturedAt: "2026-04-02T08:00:00.000Z", totalValue: 78.8 },
      { capturedAt: "2026-04-03T08:00:00.000Z", totalValue: 81.1 }
    ]);

    expect(delta).toBeCloseTo(5.8, 5);
  });
});
