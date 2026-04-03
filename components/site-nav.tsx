"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Browse" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/settings", label: "Settings" }
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="site-nav" aria-label="Primary">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href === "/" && (pathname === "/" || pathname.startsWith("/cards")));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={isActive ? "site-nav-link active" : "site-nav-link"}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
