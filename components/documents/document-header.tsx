import React from "react";
import Image from "next/image";
import type { DocumentData } from "../../lib/documents/types";

export function DocumentHeader({ data }: { data: DocumentData }) {
  const showHeaderBusinessName = !data.logoDataUrl;

  return (
    <div className="flex items-start justify-between gap-6 border-b border-stone-200 pb-8">
      <div className="space-y-3">
        {data.logoDataUrl ? (
          <Image
            src={data.logoDataUrl}
            alt=""
            className="h-14 w-auto object-contain"
            width={160}
            height={56}
            unoptimized
          />
        ) : null}
        <div>
          {showHeaderBusinessName ? (
            <h2 className="text-2xl font-semibold text-stone-900">
              {data.businessName}
            </h2>
          ) : null}
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
          {data.kind}
        </p>
        <p className="mt-1 text-2xl font-semibold text-stone-900">
          {data.documentNumber}
        </p>
        <p className="mt-1 text-sm text-stone-500">{data.documentDate}</p>
      </div>
    </div>
  );
}
