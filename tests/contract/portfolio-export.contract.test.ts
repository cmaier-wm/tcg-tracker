import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/portfolio/export/route";

const routeGuardMocks = vi.hoisted(() => ({
  requireApiAuth: vi.fn()
}));

const exportMocks = vi.hoisted(() => ({
  createPortfolioExport: vi.fn()
}));

vi.mock("@/lib/auth/route-guards", () => routeGuardMocks);
vi.mock("@/lib/portfolio/export-portfolio", () => exportMocks);

describe("portfolio export contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    routeGuardMocks.requireApiAuth.mockResolvedValue({
      userId: "user-1"
    });
  });

  it("returns a csv attachment when export generation succeeds", async () => {
    exportMocks.createPortfolioExport.mockResolvedValue({
      filename: "portfolio-export-2026-04-10.xlsx",
      rowCount: 1,
      workbook: new Uint8Array([0x50, 0x4b, 0x03, 0x04])
    });

    const response = await GET(
      new Request("http://localhost/api/portfolio/export?sort=name-asc")
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    expect(response.headers.get("Content-Disposition")).toBe(
      'attachment; filename="portfolio-export-2026-04-10.xlsx"'
    );
    expect(exportMocks.createPortfolioExport).toHaveBeenCalledWith({
      sort: "name-asc"
    });
    const body = new Uint8Array(await response.arrayBuffer());

    expect(Array.from(body)).toEqual([0x50, 0x4b, 0x03, 0x04]);
  });

  it("returns the documented empty-state payload when no holdings exist", async () => {
    exportMocks.createPortfolioExport.mockResolvedValue({
      filename: "portfolio-export-2026-04-10.xlsx",
      rowCount: 0,
      workbook: new Uint8Array()
    });

    const response = await GET(new Request("http://localhost/api/portfolio/export"));
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload).toEqual({
      error: "No portfolio data available to export.",
      code: "portfolio_empty"
    });
  });
});
