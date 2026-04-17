"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type AccountStatusResponse = {
  authenticated: boolean;
  plan: "free" | "premium" | null;
  redirectTo: string;
};

export function UpgradeSuccessRedirect({ pollIntervalMs = 2000 }: { pollIntervalMs?: number }) {
  const router = useRouter();
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    // Show manual buttons after 12 seconds if still not upgraded
    const fallbackTimer = setTimeout(() => setShowFallback(true), 12000);

    async function checkAccount() {
      try {
        const response = await fetch("/api/account", { cache: "no-store" });
        if (!response.ok) throw new Error("Account check failed");
        const account = (await response.json()) as AccountStatusResponse;
        if (cancelled) return;
        if (account.authenticated && account.plan === "premium") {
          clearTimeout(fallbackTimer);
          router.replace("/workspace/invoice");
          return;
        }
        timeoutId = setTimeout(checkAccount, pollIntervalMs);
      } catch {
        if (cancelled) return;
        timeoutId = setTimeout(checkAccount, pollIntervalMs);
      }
    }

    void checkAccount();

    return () => {
      cancelled = true;
      clearTimeout(fallbackTimer);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [pollIntervalMs, router]);

  if (showFallback) {
    return (
      <div className="mt-8 flex flex-col items-center gap-4">
        <p className="text-sm text-white/45">Taking longer than expected — you can continue manually.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/workspace/invoice"
            className="rounded-2xl bg-[#d4901e] px-6 py-3 text-sm font-bold text-[#111111] transition hover:bg-[#e8a030]"
          >
            Open Workspace
          </Link>
          <Link
            href="/profile"
            className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/75 transition hover:border-white/20 hover:text-white"
          >
            View Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-[#d4901e]" />
      <p className="text-sm text-white/45">Confirming your premium access…</p>
    </div>
  );
}
