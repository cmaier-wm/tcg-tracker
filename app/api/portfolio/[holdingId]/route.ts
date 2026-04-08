import { NextResponse } from "next/server";
import { withRouteHandler } from "@/lib/api/route-handler";
import { requireApiAuth } from "@/lib/auth/route-guards";
import { removeHolding } from "@/lib/portfolio/remove-holding";
import { updateHolding } from "@/lib/portfolio/update-holding";
import { updateHoldingPayloadSchema } from "@/lib/tcgtracking/schemas";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ holdingId: string }> }
) {
  const params = await context.params;

  return withRouteHandler(async () => {
    await requireApiAuth();
    const payload = updateHoldingPayloadSchema.parse(await request.json());
    return updateHolding(params.holdingId, payload.quantity);
  });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ holdingId: string }> }
) {
  const params = await context.params;

  try {
    await requireApiAuth();
    await removeHolding(params.holdingId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return withRouteHandler(async () => {
      throw error;
    });
  }
}
