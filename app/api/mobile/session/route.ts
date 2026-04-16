import { withRouteHandler } from "@/lib/api/route-handler";
import { getMobileSession } from "@/lib/mobile/get-mobile-session";

export async function GET() {
  return withRouteHandler(async () => getMobileSession());
}
