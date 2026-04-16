import React, { type CSSProperties } from "react";
import { calculateDocumentTotals, getPaymentTermSummary } from "../../lib/documents/calculations";
import { formatCurrency } from "../../lib/documents/format";
import type { DocumentData } from "../../lib/documents/types";

type Props = {
  data: DocumentData;
  compact?: boolean;
  totalBg?: string;
  totalText?: string;
  totalStyle?: CSSProperties;
};

export function DocumentTotals({
  data,
  compact = false,
  totalBg = "bg-stone-950",
  totalText = "text-white",
  totalStyle,
}: Props) {
  if (data.kind === "receipt") {
    return (
      <div className="rounded-sm border border-stone-200 bg-stone-50 px-5 py-4 text-right">
        {data.paymentMethod ? (
          <div className="pb-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-stone-400">
              Payment method
            </p>
            <p className="mt-1 text-base font-semibold text-stone-800">
              {data.paymentMethod}
            </p>
          </div>
        ) : null}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-stone-400">
            Amount received
          </p>
          <p className="mt-1 text-3xl font-semibold text-stone-900">
            {formatCurrency(data.amountReceived, data.currency)}
          </p>
        </div>
      </div>
    );
  }

  const totals = calculateDocumentTotals(data);
  const paymentTermSummary = getPaymentTermSummary(data);
  const containerClass = compact
    ? "ml-auto w-full max-w-sm rounded-sm border border-stone-200 bg-stone-50 px-4 py-3 text-sm"
    : "ml-auto w-full max-w-sm rounded-sm border border-stone-200 bg-stone-50 px-5 py-4 text-sm";

  return (
    <div className={containerClass}>
      <div className="flex justify-between py-2 text-stone-500">
        <span className="uppercase tracking-[0.12em]">Subtotal</span>
        <span className="tabular-nums">
          {formatCurrency(totals.subtotal, data.currency)}
        </span>
      </div>
      {data.applyTax ? (
        <div className="flex justify-between border-t border-stone-200 py-2 text-stone-500">
          <span className="uppercase tracking-[0.12em]">{data.taxLabel}</span>
          <span className="tabular-nums">
            {formatCurrency(totals.taxAmount, data.currency)}
          </span>
        </div>
      ) : null}
      {paymentTermSummary ? (
        <div className="border-t border-stone-200 py-3 text-stone-700">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-stone-400">
            Payment terms
          </p>
          <p className="mt-1 font-semibold text-stone-900">
            {paymentTermSummary.label}
          </p>
          <div className="mt-2 flex justify-between text-sm text-stone-500">
            <span className="uppercase tracking-[0.12em]">Amount due now</span>
            <span className="tabular-nums">
              {formatCurrency(paymentTermSummary.amountDue, data.currency)}
            </span>
          </div>
        </div>
      ) : null}
      <div
        className={`mt-2 flex justify-between ${totalBg} px-4 py-3 font-semibold ${totalText}`}
        style={{
          printColorAdjust: "exact",
          WebkitPrintColorAdjust: "exact",
          ...totalStyle,
        }}
      >
        <span className="uppercase tracking-[0.16em]">Total</span>
        <span className="tabular-nums text-xl">
          {formatCurrency(totals.total, data.currency)}
        </span>
      </div>
    </div>
  );
}
