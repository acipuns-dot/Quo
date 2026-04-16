"use client";

import React from "react";
import { ModalShell } from "./modal-shell";

export function ConfirmWorkspaceActionModal({
  open,
  title,
  description,
  targetLabel,
  savePending,
  errorMessage,
  onClose,
  onConfirmSave,
  onConfirmDiscard,
}: {
  open: boolean;
  title: string;
  description: string;
  targetLabel: string;
  savePending: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onConfirmSave: () => void;
  onConfirmDiscard: () => void;
}) {
  return (
    <ModalShell open={open} onClose={onClose} title={title} description={description}>
      <div className="space-y-5">
        <div className="rounded-[24px] border border-[#d4901e]/20 bg-[#d4901e]/8 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d4901e]">
            Next action
          </p>
          <p className="mt-2 text-base font-semibold text-[#faf9f7]">{targetLabel}</p>
        </div>

        {errorMessage ? <p className="text-sm text-[#f59e0b]">{errorMessage}</p> : null}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/75 transition hover:border-white/20 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmDiscard}
            className="rounded-2xl border border-[#d4901e]/25 bg-[#d4901e]/10 px-5 py-3 text-sm font-semibold text-[#faf9f7] transition hover:border-[#d4901e]/40 hover:bg-[#d4901e]/15"
          >
            Continue without saving
          </button>
          <button
            type="button"
            onClick={onConfirmSave}
            disabled={savePending}
            className="rounded-2xl bg-[#d4901e] px-5 py-3 text-sm font-bold text-[#111111] shadow-[0_10px_30px_rgba(212,144,30,0.24)] transition hover:brightness-105"
          >
            {savePending ? "Saving..." : "Save and continue"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
