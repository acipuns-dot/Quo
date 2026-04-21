"use client";

import React from "react";

export function ModalShell({
  title,
  description,
  open,
  onClose,
  children,
}: {
  title: string;
  description?: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#18120d] p-6 text-[#faf9f7] shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-white">{title}</h2>
            {description ? <p className="mt-2 text-sm leading-6 text-white/60">{description}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="text-sm font-semibold text-white/60 min-h-[44px] min-w-[44px] flex items-center justify-end">
            Close
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
