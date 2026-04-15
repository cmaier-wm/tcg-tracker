import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { BrandHomeLink } from "@/components/brand-home-link";
import { DevOriginRedirect } from "@/components/dev-origin-redirect";
import { SiteNav } from "@/components/site-nav";
import { getOptionalAuthenticatedUser } from "@/lib/auth/auth-session";
import { getAccountSettings } from "@/lib/settings/account-settings";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pokemon TCG Tracker",
  description: "Track TCG cards, price history, and portfolio value."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const authenticatedUser = await getOptionalAuthenticatedUser();
  const { themeMode } = await getAccountSettings(authenticatedUser?.userId);

  return (
    <html lang="en" data-theme={themeMode} suppressHydrationWarning>
      <body>
        <DevOriginRedirect />
        <div className="app-shell">
          <header className="site-header">
            <div className="site-header-inner">
              <div className="brand-lockup">
                <Suspense fallback={<span className="brand-mark" aria-hidden="true" />}>
                  <BrandHomeLink className="brand-mark" aria-label="Go to home page">
                    <svg
                      className="brand-mark-icon"
                      viewBox="0 0 64 64"
                      role="img"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <rect width="64" height="64" rx="14" fill="#111827" />
                      <circle cx="32" cy="32" r="20" fill="#f8fafc" stroke="#111827" strokeWidth="3" />
                      <path d="M12 32a20 20 0 0 1 40 0z" fill="#ef4444" />
                      <path d="M12 32a20 20 0 0 0 40 0z" fill="#f8fafc" />
                      <rect x="12" y="29" width="40" height="6" fill="#111827" />
                      <circle cx="32" cy="32" r="8" fill="#ffffff" stroke="#111827" strokeWidth="3" />
                      <circle cx="32" cy="32" r="3" fill="#f8fafc" stroke="#111827" strokeWidth="2" />
                    </svg>
                  </BrandHomeLink>
                </Suspense>
                <div>
                  <Suspense fallback={<span className="brand">Pokemon TCG Tracker</span>}>
                    <BrandHomeLink className="brand">
                      Pokemon TCG Tracker
                    </BrandHomeLink>
                  </Suspense>
                  <p className="eyebrow">Trading Card Database</p>
                </div>
              </div>
              <SiteNav authenticatedUser={authenticatedUser} />
            </div>
          </header>
          <main className="page-shell">{children}</main>
          <footer className="site-footer">
            <div className="site-footer-inner">
              <p>Pokemon TCG Tracker</p>
              <p>Browse Pokemon cards, inspect price history, and monitor portfolio value.</p>
            </div>
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
      </body>
    </html>
  );
}
