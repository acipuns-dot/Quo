"use client";

import React from "react";

type ActionBarProps = {
  onPrint: () => void;
  onDownloadPdf: () => void;
  workspaceMode?: boolean;
  onSave?: () => void;
  saveState?: "idle" | "saving" | "saved" | "error";
  onClearDraft?: () => void;
};

export function ActionBar({
  onPrint,
  onDownloadPdf,
  workspaceMode,
  onSave,
  saveState,
  onClearDraft,
}: ActionBarProps) {
  return (
    <>
      {/* Mobile pinned bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 flex items-center gap-2 border-t border-white/[0.07] bg-[#111111] px-4 py-3 no-print">
        {onClearDraft && (
          <button
            type="button"
            onClick={onClearDraft}
            className="flex-1 rounded-lg border border-white/10 bg-white/[0.06] py-2.5 text-sm font-semibold text-white/60 min-h-[44px]"
          >
            Clear
          </button>
        )}
        {workspaceMode && onSave && (
          <button
            type="button"
            onClick={onSave}
            disabled={saveState === "saving"}
            className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] py-2.5 text-sm font-semibold text-white min-h-[44px] disabled:opacity-60"
          >
            {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : saveState === "error" ? "Error" : "Save"}
          </button>
        )}
        <button
          type="button"
          onClick={onDownloadPdf}
          className="flex-1 rounded-lg bg-[#d4901e] py-2.5 text-sm font-semibold text-[#111111] min-h-[44px]"
        >
          Download PDF
        </button>
      </div>

      {/* Desktop inline bar */}
      <div className="hidden md:flex flex-wrap gap-2">
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
    </>
  );
}
