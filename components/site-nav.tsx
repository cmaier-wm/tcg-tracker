"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";

const navItems = [
  { href: "/", label: "Browse", requiresAuth: false },
  { href: "/portfolio", label: "Portfolio", requiresAuth: true },
  { href: "/settings", label: "Settings", requiresAuth: false }
];

export function SiteNav({
  authenticatedUser
}: {
  authenticatedUser: { email: string; displayName: string } | null;
}) {
  const pathname = usePathname();
  const visibleNavItems = navItems.filter((item) => authenticatedUser || !item.requiresAuth);

  return (
    <nav className="site-nav" aria-label="Primary">
      {visibleNavItems.map((item) => {
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
      {authenticatedUser ? (
        <SignOutButton />
      ) : (
        <>
          <Link href="/login" className={pathname === "/login" ? "site-nav-link active" : "site-nav-link"}>
            Sign In
          </Link>
          <Link
            href="/register"
            className={pathname === "/register" ? "site-nav-link active" : "site-nav-link"}
          >
            Register
          </Link>
        </>
      )}
    </nav>
  );
}
