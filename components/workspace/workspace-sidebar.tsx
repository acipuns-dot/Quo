"use client";

import React from "react";

const links = [
  { label: "Documents", value: "documents" },
  { label: "Customers", value: "customers" },
  { label: "Businesses", value: "businesses" },
  { label: "History", value: "history" },
] as const;

type WorkspaceTab = (typeof links)[number]["value"];

type WorkspaceSidebarProps = {
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
};

export function WorkspaceSidebar({ activeTab, onTabChange }: WorkspaceSidebarProps) {

  return (
    <nav className="space-y-0.5">
      {links.map((link) => (
        <button
          key={link.value}
          type="button"
          aria-pressed={activeTab === link.value}
          onClick={() => onTabChange(link.value)}
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
