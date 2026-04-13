"use client";

import type { MouseEvent, ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type BrandHomeLinkProps = {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
};

export function BrandHomeLink({ children, className, "aria-label": ariaLabel }: BrandHomeLinkProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    if (pathname === "/" && searchParams.size === 0) {
      return;
    }

    event.preventDefault();
    router.push("/");
  }

  return (
    <Link href="/" className={className} aria-label={ariaLabel} onClick={handleClick}>
      {children}
    </Link>
  );
}
