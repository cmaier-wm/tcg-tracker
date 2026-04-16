import { withRouteHandler } from "@/lib/api/route-handler";
import { getMobileHome } from "@/lib/mobile/get-mobile-home";

export async function GET() {
  return withRouteHandler(async () => getMobileHome());
}
