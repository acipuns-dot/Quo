import type { BusinessRecord } from "../../lib/workspace/types";

export function BusinessDefaultsBanner({ business }: { business: BusinessRecord }) {
  return (
    <div className="flex-shrink-0 border-b border-white/[0.07] bg-[#111111] px-5 py-2.5 text-sm text-white/45">
      <span className="mr-1.5 text-[#d4901e]">·</span>
      Creating in <span className="font-semibold text-[#faf9f7]">{business.name}</span>
    </div>
  );
}
