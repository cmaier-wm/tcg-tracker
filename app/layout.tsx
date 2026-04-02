import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
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
            <div>
              <p className="eyebrow">Portfolio + Pricing</p>
              <Link href="/" className="brand">
                TCG Tracker
              </Link>
            </div>
            <nav className="site-nav">
              <Link href="/cards">Cards</Link>
              <Link href="/portfolio">Portfolio</Link>
            </nav>
          </header>
          <main className="page-shell">{children}</main>
        </div>
      </body>
    </html>
  );
}
