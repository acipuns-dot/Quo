"use client";

import React, { useEffect, useState } from "react";
import { ModalShell } from "./modal-shell";

export function DeleteConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  requiresText,
  expectedText,
  error,
  isSubmitting,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  requiresText?: boolean;
  expectedText?: string;
  error?: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [typedValue, setTypedValue] = useState("");

  useEffect(() => {
    if (open) {
      setTypedValue("");
    }
  }, [open]);

  const canConfirm = !requiresText || typedValue === expectedText;

  return (
    <ModalShell open={open} onClose={onClose} title={title} description={description}>
      <div className="space-y-4">
        {requiresText ? (
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              Type {expectedText}
            </span>
            <input
              value={typedValue}
              onChange={(event) => setTypedValue(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
            />
          </label>
        ) : null}
        {error ? (
          <div className="rounded-2xl border border-[#dc2626]/30 bg-[#dc2626]/10 px-4 py-3 text-sm text-[#fecaca]">
            {error}
          </div>
        ) : null}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/75"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canConfirm || isSubmitting}
            onClick={() => void onConfirm()}
            className="rounded-2xl bg-[#dc2626] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {isSubmitting ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
