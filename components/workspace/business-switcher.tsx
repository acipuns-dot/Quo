"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { BusinessRecord } from "../../lib/workspace/types";
import { ThemedDropdown } from "./themed-dropdown";

type BusinessSwitcherProps = {
  businesses: BusinessRecord[];
  activeBusinessId: string;
};

const triggerClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-[#faf9f7] outline-none transition focus:border-[#d4901e]/50";

export function BusinessSwitcher({ businesses, activeBusinessId }: BusinessSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSwitchingBusiness, setIsSwitchingBusiness] = React.useState(false);
  const businessOptions = businesses.map((business) => ({
    value: business.id,
    label: business.name,
  }));

  React.useEffect(() => {
    setIsSwitchingBusiness(false);
  }, [activeBusinessId]);

  return (
    <div className="flex flex-col items-end gap-1">
      <ThemedDropdown
        ariaLabel="Active business"
        value={activeBusinessId}
        disabled={isSwitchingBusiness}
        options={businessOptions}
        buttonClassName={triggerClass}
        onSelect={(value) => {
          if (value === activeBusinessId) {
            return;
          }

          setIsSwitchingBusiness(true);
          const nextSearchParams = new URLSearchParams(searchParams.toString());
          nextSearchParams.set("businessId", value);
          nextSearchParams.set("tab", "documents");
          router.push(`${pathname}?${nextSearchParams.toString()}`);
        }}
      />
      {isSwitchingBusiness ? (
        <p className="text-xs font-medium text-white/55">Switching business...</p>
      ) : null}
    </div>
  );
}
