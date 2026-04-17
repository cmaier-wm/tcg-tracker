"use client";

type LoadingLabelProps = {
  isLoading: boolean;
  label: string;
  loadingLabel?: string;
};

export function LoadingLabel({
  isLoading,
  label,
  loadingLabel
}: LoadingLabelProps) {
  if (!isLoading) {
    return <>{label}</>;
  }

  return (
    <span className="loading-label" role="status" aria-live="polite" aria-label={loadingLabel ?? label}>
      <span className="catalog-spinner pokeball-spinner loading-label-spinner" aria-hidden="true">
        <span className="pokeball-spinner-button" />
      </span>
      <span>{label}</span>
    </span>
  );
}
