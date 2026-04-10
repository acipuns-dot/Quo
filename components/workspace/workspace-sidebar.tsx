"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const links = [
  { label: "Documents", value: "documents" },
  { label: "Customers", value: "customers" },
  { label: "Businesses", value: "businesses" },
  { label: "History", value: "history" },
] as const;

export function WorkspaceSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "documents";

  return (
    <nav className="space-y-0.5">
      {links.map((link) => (
        <button
          key={link.value}
          type="button"
          aria-pressed={activeTab === link.value}
          onClick={() => {
            const nextSearchParams = new URLSearchParams(searchParams.toString());
            nextSearchParams.set("tab", link.value);
            router.push(`${pathname}?${nextSearchParams.toString()}`);
          }}
          className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
            activeTab === link.value
              ? "border border-[#d4901e]/25 bg-[#d4901e]/10 text-[#d4901e]"
              : "text-white/45 hover:bg-white/[0.05] hover:text-white/85"
          }`}
        >
          {link.label}
        </button>
      ))}
    </nav>
  );
}
