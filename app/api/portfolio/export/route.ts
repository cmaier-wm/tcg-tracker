import { HttpError } from "@/lib/api/http-errors";
import { requireApiAuth } from "@/lib/auth/route-guards";
import { createPortfolioExport } from "@/lib/portfolio/export-portfolio";

export async function GET(request: Request) {
  try {
    await requireApiAuth();

    const url = new URL(request.url);
    const result = await createPortfolioExport({
      sort: url.searchParams.get("sort")
    });

    if (result.rowCount === 0) {
      return Response.json(
        {
          error: "No portfolio data available to export.",
          code: "portfolio_empty"
        },
        {
          status: 409
        }
      );
    }

    return new Response(result.workbook, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${result.filename}"`,
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return Response.json({ error: error.message }, { status: error.status });
    }

    return Response.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
