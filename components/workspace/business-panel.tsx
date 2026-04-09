import type { BusinessRecord } from "../../lib/workspace/types";

export function BusinessPanel({ businesses }: { businesses: BusinessRecord[] }) {
  return (
    <section>
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/25">Businesses</p>
      <div className="space-y-1">
        {businesses.map((business) => (
          <div key={business.id} className="cursor-pointer rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2 transition-colors hover:border-[#d4901e]/25 hover:bg-[#d4901e]/[0.07]">
            <div className="text-sm font-medium text-[#faf9f7]">{business.name}</div>
            <div className="text-xs text-white/40">{business.defaultCurrency}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
