import React from "react";

export default function WorkspaceKindLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="relative flex h-screen flex-col overflow-hidden bg-[#111111] text-[#faf9f7]"
    >
      <header className="flex-shrink-0 border-b border-white/[0.07] bg-[#111111]">
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="text-sm font-extrabold tracking-[0.06em] text-[#faf9f7]">
              QUO<span className="text-[#d4901e]">.</span>
            </div>
            <span className="rounded-full border border-[#d4901e]/25 bg-[#d4901e]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#d4901e]">
              Premium
            </span>
          </div>
          <div className="h-10 w-44 animate-pulse rounded-lg border border-white/10 bg-white/[0.06]" />
        </div>
      </header>
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <aside className="flex w-[220px] flex-shrink-0 flex-col gap-3 border-r border-white/[0.07] p-4">
          <div className="h-32 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />
          <div className="h-40 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />
          <div className="h-48 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />
        </aside>
        <main className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-3xl rounded-[28px] border border-white/10 bg-white/[0.04] px-8 py-12 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <div className="mx-auto h-3 w-40 animate-pulse rounded-full bg-white/10" />
            <p className="mt-6 text-2xl font-semibold text-[#faf9f7]">Switching business...</p>
            <p className="mt-3 text-sm text-white/55">Loading customers, history, and defaults.</p>
            <div className="mt-8 space-y-3">
              <div className="h-12 animate-pulse rounded-2xl bg-white/[0.06]" />
              <div className="h-12 animate-pulse rounded-2xl bg-white/[0.06]" />
              <div className="h-24 animate-pulse rounded-3xl bg-white/[0.06]" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
