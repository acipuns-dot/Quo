import React from "react";
import type { BusinessRecord } from "../../lib/workspace/types";

export function BusinessPanel({
  businesses,
  activeBusinessId,
  onSelectBusiness,
}: {
  businesses: BusinessRecord[];
  activeBusinessId?: string;
  onSelectBusiness?: (business: BusinessRecord) => void;
}) {
  return (
    <section>
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/25">Businesses</p>
      <div className="space-y-1">
        {businesses.map((business) => (
          <button
            key={business.id}
            type="button"
            aria-pressed={business.id === activeBusinessId}
            onClick={() => onSelectBusiness?.(business)}
            className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
              business.id === activeBusinessId
                ? "border-[#d4901e]/30 bg-[#d4901e]/10"
                : "border-white/[0.07] bg-white/[0.04] hover:border-[#d4901e]/25 hover:bg-[#d4901e]/[0.07]"
            }`}
          >
            <div className="text-sm font-medium text-[#faf9f7]">{business.name}</div>
            <div className="text-xs text-white/40">{business.defaultCurrency}</div>
          </button>
        ))}
      </div>
    </section>
  );
}
