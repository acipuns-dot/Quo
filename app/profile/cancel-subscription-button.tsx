"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelSubscriptionButton() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/billing/cancel", { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Failed to cancel");

      router.push("/profile?canceled=1");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-white/60">Are you sure? You&apos;ll keep access until the end of your billing period.</p>
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="rounded-xl border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-400 transition hover:border-red-500/70 disabled:opacity-60"
        >
          {loading ? "Cancelling…" : "Yes, cancel"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/50 transition hover:text-white/75"
        >
          Keep subscription
        </button>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-sm text-white/35 transition hover:text-white/60 underline underline-offset-2"
    >
      Cancel subscription
    </button>
  );
}
