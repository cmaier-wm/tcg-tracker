import React from "react";
import Link from "next/link";

type PortfolioPaginationProps = {
  page: number;
  totalPages: number;
  sort: string;
};

function buildPortfolioPageHref(page: number, sort: string) {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set("page", String(page));
  }

  if (sort && sort !== "price-desc") {
    params.set("sort", sort);
  }

  const query = params.toString();
  return query ? `/portfolio?${query}` : "/portfolio";
}

export function PortfolioPagination({
  page,
  totalPages,
  sort
}: PortfolioPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="button-row portfolio-pagination">
      {page > 1 ? (
        <Link className="button secondary" href={buildPortfolioPageHref(page - 1, sort)}>
          Previous
        </Link>
      ) : (
        <span className="button secondary" aria-disabled="true">
          Previous
        </span>
      )}
      <span className="muted">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link className="button secondary" href={buildPortfolioPageHref(page + 1, sort)}>
          Next
        </Link>
      ) : (
        <span className="button secondary" aria-disabled="true">
          Next
        </span>
      )}
    </div>
  );
}
