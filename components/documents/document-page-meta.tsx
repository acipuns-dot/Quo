import React from "react";
import type { DocumentData } from "../../lib/documents/types";

export function DocumentPageMeta({
  data,
  pageNumber,
  totalPages,
}: {
  data: DocumentData;
  pageNumber: number;
  totalPages: number;
}) {
  return (
    <div className="mb-6 flex items-center justify-between border-b border-stone-200 pb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
      <span>
        {data.kind} {data.documentNumber}
      </span>
      <span>{data.customerName || "Customer pending"}</span>
      <span>{`Page ${pageNumber} of ${totalPages}`}</span>
    </div>
  );
}
