import { withRouteHandler } from "@/lib/api/route-handler";
import { getCardCatalog } from "@/lib/tcgtracking/get-card-catalog";

const POKEMON_CATEGORY = "pokemon";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const offset = Number.parseInt(searchParams.get("offset") ?? "0", 10);
  const limit = Number.parseInt(searchParams.get("limit") ?? "20", 10);

  return withRouteHandler(async () => ({
    items: await getCardCatalog({
      q: searchParams.get("q"),
      category: POKEMON_CATEGORY,
      set: searchParams.get("set"),
      offset: Number.isNaN(offset) ? 0 : Math.max(0, offset),
      limit: Number.isNaN(limit) ? 20 : Math.max(1, limit)
    })
  }));
}
