import ExcelJS from "exceljs";
import { requireAuthenticatedUser } from "@/lib/auth/auth-session";
import { getDemoCards, getDemoUserState } from "@/lib/db/demo-store";
import { withDatabaseFallback } from "@/lib/db/runtime";
import { getDatabasePortfolio } from "@/lib/portfolio/db-portfolio";
import {
  normalizePortfolioSort,
  sortPortfolioHoldings,
  type PortfolioSortValue
} from "@/lib/portfolio/portfolio-sort";

export type PortfolioExportRow = {
  holdingId: string;
  category: string;
  setName: string;
  cardName: string;
  collectorNumber: string | null;
  variation: string;
  quantity: number;
  unitMarketPrice: number | null;
  estimatedValue: number | null;
  dateAdded: Date | null;
};

type SortablePortfolioExportRow = PortfolioExportRow & {
  id: string;
  estimatedValueForSort: number;
};

function buildFilename(generatedAt: Date) {
  const date = generatedAt.toISOString().slice(0, 10);
  return `portfolio-export-${date}.xlsx`;
}

async function buildWorkbook(rows: PortfolioExportRow[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Portfolio");

  worksheet.columns = [
    { header: "Category", key: "category", width: 18 },
    { header: "Set", key: "setName", width: 24 },
    { header: "Card", key: "cardName", width: 28 },
    { header: "Collector Number", key: "collectorNumber", width: 18 },
    { header: "Variation", key: "variation", width: 22 },
    { header: "Quantity", key: "quantity", width: 12 },
    { header: "Unit Market Price", key: "unitMarketPrice", width: 18 },
    { header: "Estimated Value", key: "estimatedValue", width: 18 },
    { header: "Date Added", key: "dateAdded", width: 18 }
  ];

  const headerRow = worksheet.getRow(1);

  headerRow.font = { bold: true, color: { argb: "FFF8FAFC" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1D4ED8" }
  };
  headerRow.alignment = { vertical: "middle" };

  rows.forEach((row) => {
    worksheet.addRow({
      category: row.category,
      setName: row.setName,
      cardName: row.cardName,
      collectorNumber: row.collectorNumber ?? "",
      variation: row.variation,
      quantity: row.quantity,
      unitMarketPrice: row.unitMarketPrice,
      estimatedValue: row.estimatedValue,
      dateAdded: row.dateAdded ?? ""
    });
  });

  worksheet.getColumn("quantity").numFmt = "0";
  worksheet.getColumn("unitMarketPrice").numFmt = '$#,##0.00;-$#,##0.00';
  worksheet.getColumn("estimatedValue").numFmt = '$#,##0.00;-$#,##0.00';
  worksheet.getColumn("dateAdded").numFmt = "mmm d, yyyy h:mm AM/PM";
  worksheet.views = [{ state: "frozen", ySplit: 1 }];

  worksheet.eachRow((row, rowNumber) => {
    row.alignment = { vertical: "middle" };

    if (rowNumber > 1) {
      row.getCell("unitMarketPrice").alignment = { horizontal: "right" };
      row.getCell("estimatedValue").alignment = { horizontal: "right" };
      row.getCell("quantity").alignment = { horizontal: "right" };
    }
  });

  return Buffer.from(await workbook.xlsx.writeBuffer());
}

function sortRows(rows: SortablePortfolioExportRow[], sort: PortfolioSortValue) {
  return sortPortfolioHoldings(
    rows.map((row) => ({
      id: row.id,
      cardName: row.cardName,
      quantity: row.quantity,
      estimatedValue: row.estimatedValueForSort
    })),
    sort
  ).map((sortedRow) => {
    const row = rows.find((candidate) => candidate.id === sortedRow.id);

    if (!row) {
      throw new Error(`Missing export row for holding ${sortedRow.id}`);
    }

    return {
      holdingId: row.holdingId,
      category: row.category,
      setName: row.setName,
      cardName: row.cardName,
      collectorNumber: row.collectorNumber,
      variation: row.variation,
      quantity: row.quantity,
      unitMarketPrice: row.unitMarketPrice,
      estimatedValue: row.estimatedValue,
      dateAdded: row.dateAdded
    };
  });
}

async function getDatabaseExportRows(sort: PortfolioSortValue) {
  const holdings = await getDatabasePortfolio();

  const rows = holdings.map<SortablePortfolioExportRow>((holding) => {
    const latestSnapshot = holding.variation.priceSnapshots[0];
    const unitMarketPrice = latestSnapshot?.marketPrice ?? null;
    const estimatedValue = unitMarketPrice == null ? null : unitMarketPrice * holding.quantity;

    return {
      id: holding.id,
      holdingId: holding.id,
      category: holding.variation.card.set.category.name,
      setName: holding.variation.card.set.name,
      cardName: holding.variation.card.name,
      collectorNumber: holding.variation.card.collectorNumber ?? null,
      variation: holding.variation.variantLabel,
      quantity: holding.quantity,
      unitMarketPrice,
      estimatedValue,
      estimatedValueForSort: estimatedValue ?? 0,
      dateAdded: holding.createdAt
    };
  });

  return sortRows(rows, sort);
}

async function getDemoExportRows(sort: PortfolioSortValue) {
  const user = await requireAuthenticatedUser();
  const store = getDemoUserState(user.userId);
  const cardsByVariationId = new Map(
    getDemoCards().flatMap((card) =>
      card.variations.map((variation) => [
        variation.id,
        {
          category: card.categoryName,
          setName: card.setName,
          cardName: card.name,
          collectorNumber: card.collectorNumber ?? null,
          variation: variation.label,
          unitMarketPrice: variation.currentPrice ?? null
        }
      ])
    )
  );

  const rows = store.holdings.map<SortablePortfolioExportRow>((holding) => {
    const variation = cardsByVariationId.get(holding.cardVariationId);
    const estimatedValue =
      variation?.unitMarketPrice == null ? null : variation.unitMarketPrice * holding.quantity;

    return {
      id: holding.id,
      holdingId: holding.id,
      category: variation?.category ?? "Unknown category",
      setName: variation?.setName ?? "Unknown set",
      cardName: variation?.cardName ?? "Unknown card",
      collectorNumber: variation?.collectorNumber ?? null,
      variation: variation?.variation ?? "Unknown variation",
      quantity: holding.quantity,
      unitMarketPrice: variation?.unitMarketPrice ?? null,
      estimatedValue,
      estimatedValueForSort: estimatedValue ?? 0,
      dateAdded: holding.createdAt ? new Date(holding.createdAt) : null
    };
  });

  return sortRows(rows, sort);
}

export async function createPortfolioExport(options?: {
  sort?: string | null;
  generatedAt?: Date;
}) {
  const sort = normalizePortfolioSort(options?.sort);
  const generatedAt = options?.generatedAt ?? new Date();
  const rows = await withDatabaseFallback(
    async () => getDatabaseExportRows(sort),
    async () => getDemoExportRows(sort)
  );

  return {
    filename: buildFilename(generatedAt),
    rowCount: rows.length,
    rows,
    workbook: await buildWorkbook(rows)
  };
}
