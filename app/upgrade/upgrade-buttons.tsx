"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Interval = "monthly" | "yearly";

export function UpgradeButtons() {
  const router = useRouter();
  const [interval, setInterval] = useState<Interval>("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/billing/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login?next=/upgrade");
          return;
        }
        throw new Error(data.error ?? "Failed to start checkout");
      }

      // Redirect to PayPal approval page
      window.location.href = data.approvalUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="mt-10 flex flex-col gap-6">
      {/* Interval toggle */}
      <div className="flex items-center gap-1 self-start rounded-2xl border border-white/10 bg-white/5 p-1">
        <button
          type="button"
          onClick={() => setInterval("monthly")}
          className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${
            interval === "monthly"
              ? "bg-[#d4901e] text-[#111]"
              : "text-white/60 hover:text-white"
          }`}
        >
          Monthly · $4.99
        </button>
        <button
          type="button"
          onClick={() => setInterval("yearly")}
          className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${
            interval === "yearly"
              ? "bg-[#d4901e] text-[#111]"
              : "text-white/60 hover:text-white"
          }`}
        >
          Yearly · $49.90
          <span className="ml-1.5 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
            Save 17%
          </span>
        </button>
      </div>

      {error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSubscribe}
          disabled={loading}
          className="rounded-2xl bg-[#d4901e] px-6 py-3 text-sm font-bold text-[#111111] transition hover:bg-[#e8a030] disabled:opacity-60"
        >
          {loading ? "Redirecting to PayPal…" : "Subscribe with PayPal"}
        </button>
        <a
          href="/invoice"
          className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/75 transition hover:border-white/20 hover:text-white"
        >
          Keep using free
        </a>
      </div>

      <p className="text-xs text-white/35">
        Sandbox mode — no real charges. You can cancel anytime from your profile.
      </p>
    </div>
  );
}
