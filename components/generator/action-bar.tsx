"use client";

import React from "react";

type ActionBarProps = {
  onPrint: () => void;
  onDownloadPdf: () => void;
};

export function ActionBar({ onPrint, onDownloadPdf }: ActionBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onPrint}
        className="rounded-full bg-stone-900 px-5 py-2 text-sm font-medium text-white hover:bg-stone-700 active:bg-stone-800"
      >
        Print
      </button>
      <button
        type="button"
        onClick={onDownloadPdf}
        className="rounded-full border border-stone-300 bg-white px-5 py-2 text-sm font-medium text-stone-700 hover:border-stone-400 hover:bg-stone-50 active:bg-stone-100"
      >
        Download PDF
      </button>
    </div>
  );
}
