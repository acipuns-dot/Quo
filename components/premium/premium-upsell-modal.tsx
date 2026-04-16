"use client";

import React from "react";
import Link from "next/link";

const featureCopy = {
  workspace:
    "Unlock the full workspace to switch businesses, keep everything organized, and pick up work from anywhere.",
  customers:
    "Save repeat customer details once and reuse them every time you create a quotation, invoice, or receipt.",
  history: "Reopen drafts and exported work whenever you need it, without rebuilding documents from scratch.",
  templates:
    "Access exclusive premium templates — Ledger, Studio, Slate, and Pulse — designed to make your documents stand out.",
} as const;

const premiumBenefits = [
  "Multi-business workspace",
  "Saved customers for repeat jobs",
  "Document history for drafts and exports",
  "Continue work across devices",
  "4 exclusive premium templates",
] as const;

export function PremiumUpsellModal({
  feature,
  open,
  onClose,
}: {
  feature: keyof typeof featureCopy;
  open: boolean;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Unlock Quo Premium"
        className="w-full max-w-2xl rounded-[28px] border border-[#d4901e]/20 bg-[#18120d] p-8 text-[#faf9f7] shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d4901e]">
          Premium workspace
        </p>
        <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.03em] text-white">
          Unlock Quo Premium
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">{featureCopy[feature]}</p>

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {premiumBenefits.map((benefit) => (
            <div
              key={benefit}
              className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85"
            >
              {benefit}
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/75"
          >
            Keep using free
          </button>
          <Link
            href="/upgrade"
            className="rounded-2xl bg-[#d4901e] px-5 py-3 text-sm font-bold text-[#111111]"
          >
            Upgrade to Premium
          </Link>
        </div>
      </div>
    </div>
  );
}
