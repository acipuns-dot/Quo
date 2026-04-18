"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [] as const;

const landingPageLinks = [
  { href: "/#plans", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
] as const;

function ContactDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="quo-nav-link rounded-md px-3 py-2 transition-all duration-150 flex items-center gap-1"
      >
        Contact
        <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-52 quo-site-header border rounded-xl shadow-lg py-1.5 z-50">
          <a
            href="mailto:quo.support@gmail.com"
            className="quo-nav-link flex items-center gap-2.5 px-4 py-2.5 text-sm rounded-md mx-1"
            onClick={() => setOpen(false)}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
            quo.support@gmail.com
          </a>
          <a
            href="https://discord.gg/5Kv5NXQQcz"
            target="_blank"
            rel="noopener noreferrer"
            className="quo-nav-link flex items-center gap-2.5 px-4 py-2.5 text-sm rounded-md mx-1"
            onClick={() => setOpen(false)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.031.057a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
            </svg>
            Discord community
          </a>
        </div>
      )}
    </div>
  );
}

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
          {pathname === "/" && <ContactDropdown />}
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
