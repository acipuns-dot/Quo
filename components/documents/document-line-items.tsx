import React from "react";
import { formatCurrency } from "../../lib/documents/format";
import { formatLineItemQuantity } from "../../lib/documents/line-items";
import type { DocumentData, DocumentLayoutMode, LineItem } from "../../lib/documents/types";

type Props = {
  data: DocumentData;
  items?: LineItem[];
  layoutMode?: DocumentLayoutMode;
  headerBg?: string;
  headerText?: string;
  headerStyle?: React.CSSProperties;
};

export function DocumentLineItems({
  data,
  items = data.lineItems,
  layoutMode = "comfortable",
  headerBg = "bg-stone-950",
  headerText = "text-white",
  headerStyle,
}: Props) {
  if (data.kind === "receipt") {
    return null;
  }

  const bodyCell = layoutMode === "compact" ? "px-4 py-3.5" : "px-4 py-5";
  const noteClass =
    layoutMode === "compact"
      ? "mt-1 whitespace-pre-line text-[11px] leading-4 text-stone-500"
      : "mt-2 whitespace-pre-line text-xs leading-5 text-stone-500";

  return (
    <table className="w-full border-separate border-spacing-0 text-sm">
      <thead>
        <tr className={`${headerBg} ${headerText}`} style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact", ...headerStyle }}>
          <th className="rounded-l-sm px-4 py-4 text-left text-[10px] font-bold uppercase tracking-[0.24em]">
            Deliverable
          </th>
          <th className="px-4 py-4 text-right text-[10px] font-bold uppercase tracking-[0.24em]">
            Unit
          </th>
          <th className="px-4 py-4 text-right text-[10px] font-bold uppercase tracking-[0.24em]">
            Unit Price
          </th>
          <th className="rounded-r-sm px-4 py-4 text-right text-[10px] font-bold uppercase tracking-[0.24em]">
            Amount
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr
            key={item.id}
            className={index % 2 === 0 ? "bg-white" : "bg-stone-50/80"}
          >
            <td className={`border-b border-stone-200 align-top text-stone-900 ${bodyCell}`}>
              <p className="font-semibold">{item.description}</p>
              {item.note ? (
                <p className={noteClass}>
                  {item.note}
                </p>
              ) : null}
            </td>
            <td className={`border-b border-stone-200 text-right align-top tabular-nums text-stone-500 ${bodyCell}`}>
              {formatLineItemQuantity(item)}
            </td>
            <td className={`border-b border-stone-200 text-right align-top tabular-nums text-stone-500 ${bodyCell}`}>
              {formatCurrency(item.unitPrice, data.currency)}
            </td>
            <td className={`border-b border-stone-200 text-right align-top tabular-nums text-lg font-semibold text-stone-900 ${bodyCell}`}>
              {formatCurrency(item.quantity * item.unitPrice, data.currency)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
