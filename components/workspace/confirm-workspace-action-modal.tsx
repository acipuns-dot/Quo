"use client";

import React from "react";
import { ModalShell } from "./modal-shell";

export function ConfirmWorkspaceActionModal({
  open,
  title,
  description,
  targetLabel,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  targetLabel: string;
  onClose: () => void;
  onConfirm: () => void;
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

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/75 transition hover:border-white/20 hover:text-white"
          >
            Stay here
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-2xl bg-[#d4901e] px-5 py-3 text-sm font-bold text-[#111111] shadow-[0_10px_30px_rgba(212,144,30,0.24)] transition hover:brightness-105"
          >
            Discard changes and continue
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
