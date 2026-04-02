import { withRouteHandler } from "@/lib/api/route-handler";
import { getCardCatalog } from "@/lib/tcgtracking/get-card-catalog";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  return withRouteHandler(async () => ({
    items: await getCardCatalog({
      q: searchParams.get("q"),
      category: searchParams.get("category"),
      set: searchParams.get("set")
    })
  }));
}

