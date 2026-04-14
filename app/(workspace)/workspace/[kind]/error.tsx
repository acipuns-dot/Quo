"use client";

import Link from "next/link";
import React from "react";

export default function WorkspaceKindError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#111111] px-6 text-[#faf9f7]">
      <div className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#d4901e]">
          Workspace Error
        </p>
        <h1 className="mt-3 text-2xl font-semibold">
          Something went wrong while loading this workspace.
        </h1>
        <p className="mt-3 text-sm text-white/60">
          Try again, or return to your documents. Your saved data should still be intact.
        </p>
        {error.digest ? (
          <p className="mt-3 text-xs text-white/35">Reference: {error.digest}</p>
        ) : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="rounded-2xl bg-[#d4901e] px-4 py-2.5 text-sm font-bold text-[#111111]"
          >
            Try again
          </button>
          <Link
            href="/workspace/invoice"
            className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/80"
          >
            Go to workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
