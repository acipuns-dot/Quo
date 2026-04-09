"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/#plans", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
] as const;

type HeaderAccountState = {
  authenticated: boolean;
  plan: "free" | "premium" | null;
};

export function SiteHeader() {
  const pathname = usePathname();
  const [account, setAccount] = useState<HeaderAccountState | null>(null);

  useEffect(() => {
    let active = true;

    async function loadAccount() {
      try {
        const response = await fetch("/api/account", { method: "GET" });

        if (!response.ok) {
          throw new Error("Unable to load account");
        }

        const payload = (await response.json()) as HeaderAccountState & { redirectTo: string };

        if (active) {
          setAccount({
            authenticated: payload.authenticated,
            plan: payload.plan,
          });
        }
      } catch {
        if (active) {
          setAccount({ authenticated: false, plan: null });
        }
      }
    }

    void loadAccount();

    return () => {
      active = false;
    };
  }, []);

  const isAuthenticated = account?.authenticated ?? false;

  return (
    <header className="quo-site-header sticky top-0 z-10 border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="quo-logo rounded-md px-2 py-1 text-base font-bold text-white transition-opacity hover:opacity-80">
          QUO
        </Link>
        <nav className="hidden md:flex gap-1 text-sm font-medium">
          {navLinks.map((link) => {
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
              className="quo-header-login rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 active:scale-95"
            >
              Profile
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="quo-header-login rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 active:scale-95"
              >
                Login
              </Link>
              <Link
                href="/invoice"
                className="quo-header-cta rounded-lg px-4 py-2 text-sm font-bold transition-all duration-150 hover:brightness-110 active:scale-95"
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
