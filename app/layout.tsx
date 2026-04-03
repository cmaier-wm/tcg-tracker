import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "TCG Tracker",
  description: "Track TCG cards, price history, and portfolio value."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <header className="site-header">
            <div className="brand-lockup">
              <Link href="/" className="brand-mark" aria-label="Go to home page">
                <span className="brand-mark-dot" />
              </Link>
              <div>
                <Link href="/" className="brand">
                  TCG Tracker
                </Link>
                <p className="eyebrow">Pokemon Card Database</p>
              </div>
            </div>
            <SiteNav />
          </header>
          <main className="page-shell">{children}</main>
          <footer className="site-footer">
            <p>TCG Tracker</p>
            <p>Browse Pokemon cards, inspect price history, and monitor portfolio value.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
