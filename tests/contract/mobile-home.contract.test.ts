import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/mobile/home/route";

const mobileHomeMocks = vi.hoisted(() => ({
  getMobileHome: vi.fn()
}));

vi.mock("@/lib/mobile/get-mobile-home", () => mobileHomeMocks);

describe("mobile home contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the documented summary payload", async () => {
    mobileHomeMocks.getMobileHome.mockResolvedValue({
      displayName: "Collector",
      totalEstimatedValue: 123.45,
      todayProfitLoss: -3.21,
      holdingCount: 2,
      totalCardQuantity: 5,
      historyPreview: [
        {
          capturedAt: "2026-04-10T12:00:00.000Z",
          totalValue: 120
        }
      ],
      emptyState: false
    });

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      displayName: expect.any(String),
      totalEstimatedValue: expect.any(Number),
      todayProfitLoss: expect.any(Number),
      holdingCount: expect.any(Number),
      totalCardQuantity: expect.any(Number),
      historyPreview: expect.any(Array),
      emptyState: expect.any(Boolean)
    });
    expect(payload.historyPreview[0]).toMatchObject({
      capturedAt: expect.any(String),
      totalValue: expect.any(Number)
    });
  });
});
