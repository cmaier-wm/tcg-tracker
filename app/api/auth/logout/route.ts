import { NextResponse } from "next/server";
import { clearAuthSessionCookie, invalidateCurrentAuthSession } from "@/lib/auth/auth-session";
import { recordAuthAuditEvent } from "@/lib/auth/audit-log";

async function safeRecordAuthAuditEvent(input: {
  userId?: string | null;
  eventType: string;
  outcome: string;
  detail?: string | null;
}) {
  try {
    await recordAuthAuditEvent(input);
  } catch (error) {
    console.error("Unable to record auth audit event.", error);
  }
}

export async function POST() {
  await invalidateCurrentAuthSession();
  await clearAuthSessionCookie();
  await safeRecordAuthAuditEvent({
    eventType: "logout",
    outcome: "success"
  });

  return new NextResponse(null, { status: 204 });
}
