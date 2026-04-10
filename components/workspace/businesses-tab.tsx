import React from "react";
import type { BusinessRecord } from "../../lib/workspace/types";
import type { DocumentKind } from "../../lib/documents/types";

export function BusinessesTab({
  businesses,
  activeBusiness,
  kind,
}: {
  businesses: BusinessRecord[];
  activeBusiness: BusinessRecord;
  kind: DocumentKind;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[#faf9f7]">Businesses</h2>
        <p className="mt-1 text-sm text-white/40">Manage your businesses and switch between them.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {businesses.map((business) => (
          <a
            key={business.id}
            href={`/workspace/${kind}?businessId=${business.id}&tab=documents`}
            className={`group rounded-2xl border p-4 transition-all ${
              business.id === activeBusiness.id
                ? "border-[#d4901e]/40 bg-[#d4901e]/10"
                : "border-white/[0.07] bg-white/[0.03] hover:border-[#d4901e]/25 hover:bg-[#d4901e]/[0.06]"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-sm font-bold text-[#faf9f7]">
                {business.name.charAt(0).toUpperCase()}
              </div>
              {business.id === activeBusiness.id && (
                <span className="rounded-full border border-[#d4901e]/30 bg-[#d4901e]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#d4901e]">
                  Active
                </span>
              )}
            </div>
            <div className="text-sm font-semibold text-[#faf9f7]">{business.name}</div>
            <div className="mt-0.5 text-xs text-white/40">{business.defaultCurrency}</div>
            {business.email && (
              <div className="mt-0.5 text-xs text-white/30">{business.email}</div>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
