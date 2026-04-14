import type { AuthenticatedUser } from "@/lib/auth/auth-session";

export type MobileSessionResponse = {
  status: "authenticated";
  user: AuthenticatedUser;
};

export type MobileHomeResponse = {
  displayName: string;
  totalEstimatedValue: number;
  todayProfitLoss: number;
  holdingCount: number;
  totalCardQuantity: number;
  historyPreview: Array<{
    capturedAt: string;
    totalValue: number;
  }>;
  emptyState: boolean;
};
