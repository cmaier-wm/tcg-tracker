import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { HttpError } from "@/lib/api/http-errors";

export async function withRouteHandler<T>(handler: () => Promise<T>) {
  try {
    const payload = await handler();
    return NextResponse.json(payload);
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid request payload", issues: error.issues },
        { status: 400 }
      );
    }

    console.error("Unhandled route error", error);

    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
