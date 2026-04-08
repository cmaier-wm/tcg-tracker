import { NextResponse } from "next/server";
import { getOptionalAuthenticatedUser } from "@/lib/auth/auth-session";

export async function GET(
  _request: Request,
  context: { params: Promise<{ nextauth?: string[] }> }
) {
  const { nextauth = [] } = await context.params;

  if (nextauth[0] === "session") {
    const user = await getOptionalAuthenticatedUser();
    return NextResponse.json(user);
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function POST() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
