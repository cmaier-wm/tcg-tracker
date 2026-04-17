"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoadingLabel } from "@/components/ui/loading-label";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="site-nav-link site-nav-action button-reset"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const response = await fetch("/api/auth/logout", {
            method: "POST"
          });

          if (!response.ok) {
            toast.error("Unable to sign out.");
            return;
          }

          toast.success("Signed out");
          router.push("/login");
          router.refresh();
        })
      }
    >
      <LoadingLabel isLoading={isPending} label="Sign Out" loadingLabel="Signing out" />
    </button>
  );
}
