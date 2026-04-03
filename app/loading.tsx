import React from "react";

export default function AppLoading() {
  return (
    <div className="route-loading" role="status" aria-live="polite" aria-label="Loading page">
      <div className="catalog-spinner pokeball-spinner" aria-hidden="true">
        <span className="pokeball-spinner-button" />
      </div>
      <p className="muted">Loading page...</p>
    </div>
  );
}
