import { prisma } from "@/lib/db/prisma";
import { getDemoStore, getDemoUserState, type DemoUserAccount } from "@/lib/db/demo-store";
import { withDatabaseFallback } from "@/lib/db/runtime";
import { findLegacyUserAccount } from "@/lib/auth/auth-session";
import { recordAuthAuditEvent } from "@/lib/auth/audit-log";

export async function claimLegacyBootstrapData(newUserId: string) {
  return withDatabaseFallback(
    async () => {
      const legacyUser = await findLegacyUserAccount();

      if (!legacyUser) {
        return false;
      }

      if (legacyUser.id === newUserId) {
        return false;
      }

      await prisma.$transaction(async (tx) => {
        await tx.portfolioHolding.updateMany({
          where: { userId: legacyUser.id },
          data: { userId: newUserId }
        });

        await tx.portfolioValuationSnapshot.updateMany({
          where: { userId: legacyUser.id },
          data: { userId: newUserId }
        });

        await tx.teamsAlertPreference.updateMany({
          where: { userId: legacyUser.id },
          data: { userId: newUserId }
        });

        await tx.teamsAlertDelivery.updateMany({
          where: { userId: legacyUser.id },
          data: { userId: newUserId }
        });

        await tx.userAccount.update({
          where: { id: legacyUser.id },
          data: { legacyClaimedAt: new Date() }
        });
      });

      await recordAuthAuditEvent({
        userId: newUserId,
        eventType: "legacy_claim",
        outcome: "claimed"
      });

      return true;
    },
    async () => {
      const store = getDemoStore();
      const legacyUser = store.users.find(
        (user) => user.isLegacyDefault && !user.legacyClaimedAt
      );

      if (!legacyUser || legacyUser.id === newUserId) {
        return false;
      }

      const legacyState = getDemoUserState(legacyUser.id);
      const nextState = getDemoUserState(newUserId);

      nextState.holdings = [...legacyState.holdings];
      nextState.portfolioHistory = [...legacyState.portfolioHistory];
      nextState.teamsAlertPreference = legacyState.teamsAlertPreference
        ? { ...legacyState.teamsAlertPreference }
        : null;
      nextState.teamsAlertDeliveries = legacyState.teamsAlertDeliveries.map((delivery) => ({
        ...delivery,
        userId: newUserId
      }));

      legacyState.holdings = [];
      legacyState.portfolioHistory = [];
      legacyState.teamsAlertPreference = null;
      legacyState.teamsAlertDeliveries = [];
      legacyUser.legacyClaimedAt = new Date().toISOString();

      await recordAuthAuditEvent({
        userId: newUserId,
        eventType: "legacy_claim",
        outcome: "claimed"
      });

      return true;
    }
  );
}
