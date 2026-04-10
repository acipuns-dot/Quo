import React from "react";
import type { BusinessRecord } from "../../lib/workspace/types";

export function SettingsTab({ business }: { business: BusinessRecord }) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[#faf9f7]">Settings</h2>
        <p className="mt-1 text-sm text-white/40">Business defaults and workspace preferences.</p>
      </div>
      <div className="max-w-xl space-y-4">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-white/40">
            Business Details
          </h3>
          <div className="space-y-3">
            <Row label="Name" value={business.name} />
            <Row label="Email" value={business.email} />
            <Row label="Phone" value={business.phone} />
            <Row label="Address" value={business.address} />
            <Row label="Tax Number" value={business.taxNumber} />
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-white/40">
            Defaults
          </h3>
          <div className="space-y-3">
            <Row label="Currency" value={business.defaultCurrency} />
            <Row label="Tax Label" value={business.defaultTaxLabel} />
            <Row
              label="Tax Rate"
              value={business.defaultTaxRate ? `${business.defaultTaxRate}%` : null}
            />
            <Row label="Payment Terms" value={business.defaultPaymentTerms} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="shrink-0 text-white/40">{label}</span>
      <span className="text-right text-[#faf9f7]">
        {value ? String(value) : <span className="text-white/20">-</span>}
      </span>
    </div>
  );
}
