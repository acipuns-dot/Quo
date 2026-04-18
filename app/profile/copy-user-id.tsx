"use client";

import { useState } from "react";

export function CopyUserId({ shortId }: { shortId: string | null }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!shortId) return;
    await navigator.clipboard.writeText(shortId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 col-span-full">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">User ID</p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="font-mono text-sm text-white/70">
          {shortId ?? "—"}
        </p>
        {shortId ? (
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/50 transition hover:border-white/20 hover:text-white"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
