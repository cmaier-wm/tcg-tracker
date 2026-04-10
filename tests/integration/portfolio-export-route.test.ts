import ExcelJS from "exceljs";
import { beforeEach, describe, expect, it } from "vitest";
import { GET } from "@/app/api/portfolio/export/route";
import { getDemoUserState, resetDemoStore } from "@/lib/db/demo-store";
import { setTestAuthenticatedUser } from "@/lib/auth/auth-session";

describe("portfolio export route", () => {
  beforeEach(() => {
    resetDemoStore();
    setTestAuthenticatedUser(undefined);
  });

  it("exports all holdings for the authenticated user as an excel workbook", async () => {
    const store = getDemoUserState("demo-user");

    store.holdings.splice(0, store.holdings.length, ...[
      {
        id: "holding-1",
        cardVariationId: "onepiece-luffy-en-foil",
        quantity: 1,
        createdAt: "2026-04-01T08:00:00.000Z"
      },
      {
        id: "holding-2",
        cardVariationId: "sv1-charizard-ex-en-nm-holo",
        quantity: 2,
        createdAt: "2026-04-02T08:00:00.000Z"
      },
      {
        id: "holding-3",
        cardVariationId: "lorcana-belle-en-coldfoil",
        quantity: 3,
        createdAt: "2026-04-03T08:00:00.000Z"
      }
    ]);

    const response = await GET(
      new Request("http://localhost/api/portfolio/export?sort=name-asc")
    );
    const workbook = new ExcelJS.Workbook();

    await workbook.xlsx.load(await response.arrayBuffer());

    const worksheet = workbook.getWorksheet("Portfolio");
    const headerRow = worksheet?.getRow(1);
    const rows = worksheet?.getRows(2, 3) ?? [];

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    expect(response.headers.get("Content-Disposition")).toContain(".xlsx");
    expect(headerRow?.values?.slice(1)).toEqual([
      "Category",
      "Set",
      "Card",
      "Collector Number",
      "Variation",
      "Quantity",
      "Unit Market Price",
      "Estimated Value",
      "Date Added"
    ]);
    expect(rows).toHaveLength(3);
    expect(rows[0]?.getCell(3).value).toBe("Belle - Strange but Special");
    expect(rows[1]?.getCell(3).value).toBe("Charizard ex");
    expect(rows[2]?.getCell(3).value).toBe("Monkey.D.Luffy");
    expect(worksheet?.getColumn(6).numFmt).toBe("0");
    expect(worksheet?.getColumn(7).numFmt).toBe('$#,##0.00;-$#,##0.00');
    expect(worksheet?.getColumn(8).numFmt).toBe('$#,##0.00;-$#,##0.00');
    expect(worksheet?.getColumn(9).numFmt).toBe("mmm d, yyyy h:mm AM/PM");
    expect(worksheet?.getRow(2).getCell(9).value).toBeInstanceOf(Date);
  });

  it("returns an empty-state response when the portfolio has no holdings", async () => {
    const response = await GET(new Request("http://localhost/api/portfolio/export"));
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.code).toBe("portfolio_empty");
  });

  it("rejects export when the current session is missing", async () => {
    setTestAuthenticatedUser(null);

    const response = await GET(new Request("http://localhost/api/portfolio/export"));
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toBe("Authentication is required.");
  });

  it("exports only holdings that belong to the authenticated account", async () => {
    getDemoUserState("demo-user").holdings.push({
      id: "holding-default",
      cardVariationId: "onepiece-luffy-en-foil",
      quantity: 1,
      createdAt: "2026-04-01T08:00:00.000Z"
    });
    setTestAuthenticatedUser({
      userId: "user-2",
      email: "collector2@example.com",
      displayName: "Collector Two"
    });
    getDemoUserState("user-2").holdings.push({
      id: "holding-user-2",
      cardVariationId: "sv1-charizard-ex-en-nm-holo",
      quantity: 2,
      createdAt: "2026-04-02T08:00:00.000Z"
    });

    const response = await GET(new Request("http://localhost/api/portfolio/export"));
    const workbook = new ExcelJS.Workbook();

    await workbook.xlsx.load(await response.arrayBuffer());

    const worksheet = workbook.getWorksheet("Portfolio");
    const cardNames = (worksheet?.getRows(2, worksheet.rowCount - 1) ?? []).map((row) =>
      String(row.getCell(3).value)
    );

    expect(response.status).toBe(200);
    expect(cardNames).toContain("Charizard ex");
    expect(cardNames).not.toContain("Monkey.D.Luffy");
  });
});
