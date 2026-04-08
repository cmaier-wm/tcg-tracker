import { prisma } from "@/lib/db/prisma";
import { getDemoStore } from "@/lib/db/demo-store";
import { withDatabaseFallback } from "@/lib/db/runtime";

export async function recordAuthAuditEvent(input: {
  userId?: string | null;
  eventType: string;
  outcome: string;
  detail?: string | null;
}) {
  return withDatabaseFallback(
    async () => {
      await prisma.authAuditEvent.create({
        data: {
          userId: input.userId ?? null,
          eventType: input.eventType,
          outcome: input.outcome,
          detail: input.detail ?? null
        }
      });
    },
    async () => {
      getDemoStore().authAuditEvents.push({
        id: `audit-${Math.random().toString(36).slice(2, 10)}`,
        userId: input.userId ?? null,
        eventType: input.eventType,
        outcome: input.outcome,
        detail: input.detail ?? null,
        createdAt: new Date().toISOString()
      });
    }
  );
}
