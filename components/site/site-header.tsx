"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [] as const;

const landingPageLinks = [
  { href: "/#plans", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#contact", label: "Contact" },
] as const;

export type SiteHeaderAccount = {
  authenticated: boolean;
  plan: "free" | "premium" | null;
};

export function SiteHeader({ account }: { account: SiteHeaderAccount }) {
  const pathname = usePathname();
  const isAuthenticated = account.authenticated;
  const links = pathname === "/" ? [...navLinks, ...landingPageLinks] : navLinks;

  return (
    <header className="quo-site-header sticky top-0 z-10 border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="quo-logo rounded-md px-2 py-1 text-base font-bold text-white transition-opacity hover:opacity-80">
          QUODO
        </Link>
        <nav className="hidden md:flex gap-1 text-sm font-medium items-center">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`quo-nav-link rounded-md px-3 py-2 transition-all duration-150 ${isActive ? "quo-nav-link--active" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Link
              href="/profile"
              className="quo-header-login rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 active:scale-95 min-h-[44px] flex items-center"
            >
              Profile
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="quo-header-login rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 active:scale-95 min-h-[44px] flex items-center"
              >
                Login
              </Link>
              <Link
                href="/invoice"
                className="quo-header-cta rounded-lg px-4 py-2 text-sm font-bold transition-all duration-150 hover:brightness-110 active:scale-95 min-h-[44px] flex items-center"
              >
                Start free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
