import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Script from "next/script";
import { Toaster } from "sonner";
import { SiteNav } from "@/components/site-nav";
import { themeStorageKey } from "@/lib/settings/theme-storage";
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
    <html lang="en" suppressHydrationWarning>
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
          <Toaster
            position="bottom-right"
            richColors
            toastOptions={{
              classNames: {
                toast: "app-toast",
                success: "app-toast-success",
                error: "app-toast-error",
                title: "app-toast-title"
              }
            }}
          />
        </div>
        <Script id="theme-init" strategy="beforeInteractive">{`
          (function () {
            try {
              var stored = localStorage.getItem(${JSON.stringify(themeStorageKey)});
              var theme = stored === "dark" ? "dark" : "light";
              document.documentElement.dataset.theme = theme;
              document.documentElement.style.colorScheme = theme;
            } catch (error) {
              document.documentElement.dataset.theme = "light";
              document.documentElement.style.colorScheme = "light";
            }
          })();
        `}</Script>
      </body>
    </html>
  );
}
