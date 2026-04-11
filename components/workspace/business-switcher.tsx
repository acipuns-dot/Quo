 "use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { BusinessRecord } from "../../lib/workspace/types";

type BusinessSwitcherProps = {
  businesses: BusinessRecord[];
  activeBusinessId: string;
};

export function BusinessSwitcher({ businesses, activeBusinessId }: BusinessSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <select
      aria-label="Active business"
      value={activeBusinessId}
      onChange={(event) => {
        const nextSearchParams = new URLSearchParams(searchParams.toString());
        nextSearchParams.set("businessId", event.target.value);
        nextSearchParams.set("tab", "documents");
        router.push(`${pathname}?${nextSearchParams.toString()}`);
      }}
      className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-[#faf9f7] outline-none focus:border-[#d4901e]/50"
    >
      {businesses.map((business) => (
        <option key={business.id} value={business.id}>
          {business.name}
        </option>
      ))}
    </select>
  );
}
