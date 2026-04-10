import React from "react";
import type { CustomerRecord } from "../../lib/workspace/types";

export function CustomersTab({
  customers,
  businessId,
}: {
  customers: CustomerRecord[];
  businessId: string;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[#faf9f7]">Customers</h2>
        <p className="mt-1 text-sm text-white/40">Saved customers for this business.</p>
      </div>
      {customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.02] py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05]">
            <svg className="h-6 w-6 text-white/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-white/40">No customers yet</p>
          <p className="mt-1 text-xs text-white/25">Customers will appear here once added from the document editor.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 transition-all hover:border-[#d4901e]/25 hover:bg-[#d4901e]/[0.06]"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-sm font-bold text-[#faf9f7]">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-sm font-semibold text-[#faf9f7]">{customer.name}</div>
              {customer.email && <div className="mt-0.5 text-xs text-white/40">{customer.email}</div>}
              {customer.address && <div className="mt-0.5 text-xs text-white/30 line-clamp-1">{customer.address}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
