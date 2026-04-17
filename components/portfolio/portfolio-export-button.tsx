"use client";

import { useTransition } from "react";
import { Download } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { LoadingLabel } from "@/components/ui/loading-label";

function getDownloadFilename(headerValue: string | null) {
  if (!headerValue) {
    return "portfolio-export.csv";
  }

  const utfMatch = /filename\*=UTF-8''([^;]+)/i.exec(headerValue);

  if (utfMatch) {
    return decodeURIComponent(utfMatch[1]);
  }

  const asciiMatch = /filename="([^"]+)"/i.exec(headerValue);
  return asciiMatch?.[1] ?? "portfolio-export.csv";
}

function triggerDownload(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filename;
  link.style.display = "none";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

export function PortfolioExportButton({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const helperText = disabled ? "Add a holding to enable spreadsheet export." : null;

  return (
    <div className="portfolio-export-control">
      <button
        className="button secondary portfolio-export-button"
        type="button"
        disabled={disabled || isPending}
        onClick={() =>
          startTransition(async () => {
            const params = new URLSearchParams();
            const sort = searchParams.get("sort");

            if (sort) {
              params.set("sort", sort);
            }

            const exportUrl = params.size
              ? `/api/portfolio/export?${params.toString()}`
              : "/api/portfolio/export";
            const response = await fetch(exportUrl);

            if (response.ok) {
              const blob = await response.blob();
              const filename = getDownloadFilename(
                response.headers.get("Content-Disposition")
              );

              triggerDownload(blob, filename);
              toast.success("Portfolio export downloaded.");
              return;
            }

            if (response.status === 401) {
              const returnTo = `${window.location.pathname}${window.location.search}`;
              router.push(`/login?returnTo=${encodeURIComponent(returnTo)}`);
              return;
            }

            let message = "Unable to export portfolio.";

            try {
              const payload = (await response.json()) as { error?: string };
              message = payload.error ?? message;
            } catch {}

            toast.error(message);
          })
        }
      >
        {isPending ? null : (
          <Download
            aria-hidden="true"
            className="portfolio-export-button-icon"
            strokeWidth={2}
          />
        )}
        <LoadingLabel
          isLoading={isPending}
          label="Export Portfolio"
          loadingLabel="Exporting portfolio"
        />
      </button>
      {helperText ? <p className="muted portfolio-export-note">{helperText}</p> : null}
    </div>
  );
}
