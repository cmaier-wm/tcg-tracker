"use client";

import React, { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  getPortfolioSortOptions,
  type PortfolioSortValue
} from "@/lib/portfolio/portfolio-sort";

type PortfolioSortProps = {
  selectedSort: PortfolioSortValue;
};

const defaultPortfolioSortValue: PortfolioSortValue = "price-desc";

export function PortfolioSort({ selectedSort }: PortfolioSortProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, startNavigation] = useTransition();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextSort = event.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (!nextSort || nextSort === defaultPortfolioSortValue) {
      params.delete("sort");
    } else {
      params.set("sort", nextSort);
    }

    const nextUrl = params.size ? `${pathname}?${params.toString()}` : pathname;
    const currentUrl = searchParams.size ? `${pathname}?${searchParams.toString()}` : pathname;

    if (nextUrl === currentUrl) {
      return;
    }

    startNavigation(() => {
      router.replace(nextUrl);
    });
  }

  return (
    <div className="field portfolio-sort-control">
      <label htmlFor="portfolio-sort">Sort</label>
      <select
        id="portfolio-sort"
        name="sort"
        defaultValue={selectedSort}
        onChange={handleChange}
        disabled={isNavigating}
      >
        {getPortfolioSortOptions().map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
