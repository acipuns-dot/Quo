"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Interval = "monthly" | "yearly";

const pricing: Record<Interval, { price: string; period: string; sub: string }> = {
  monthly: { price: "$4.99", period: "/month", sub: "Billed monthly" },
  yearly: { price: "$4.16", period: "/month", sub: "Billed $49.90/year" },
};

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

      window.location.href = data.approvalUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  const current = pricing[interval];

  return (
    <div className="flex flex-col gap-6">

      {/* Interval toggle */}
      <div className="flex items-center gap-1 self-stretch rounded-2xl border border-white/10 bg-white/5 p-1">
        <button
          type="button"
          onClick={() => setInterval("monthly")}
          className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            interval === "monthly"
              ? "bg-[#d4901e] text-[#111]"
              : "text-white/55 hover:text-white"
          }`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setInterval("yearly")}
          className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            interval === "yearly"
              ? "bg-[#d4901e] text-[#111]"
              : "text-white/55 hover:text-white"
          }`}
        >
          Yearly
          <span className="ml-1.5 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
            −17%
          </span>
        </button>
      </div>

      {/* Price display */}
      <div className="border-b border-white/8 pb-6">
        <div className="flex items-end gap-1">
          <span className="text-5xl font-extrabold tracking-[-0.04em] text-white">
            {current.price}
          </span>
          <span className="mb-1.5 text-sm font-medium text-white/45">{current.period}</span>
        </div>
        <p className="mt-1.5 text-xs text-white/40">{current.sub}</p>
      </div>

      {/* CTA */}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <button
        type="button"
        onClick={handleSubscribe}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#d4901e] py-3.5 text-sm font-bold text-[#111111] transition hover:bg-[#e8a030] disabled:opacity-60"
      >
        {loading ? (
          "Redirecting to PayPal…"
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-4 w-4 shrink-0"
              aria-hidden="true"
            >
              {/* PayPal "P" mark */}
              <path
                fill="#003087"
                d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z"
              />
              <path
                fill="#009cde"
                d="M23.054 7.763c-.91 4.695-4.005 7.712-9.222 7.712H11.44l-1.395 8.857a.374.374 0 0 1-.37.316H6.12a.374.374 0 0 1-.37-.432l.372-2.36.006-.036 1.097-6.958.07-.443a.641.641 0 0 1 .634-.541h1.997c4.298 0 7.664-1.748 8.648-6.797.03-.15.054-.294.077-.437.282-.035.547-.044.793-.027.915.062 1.643.316 2.01.667z"
              />
            </svg>
            Subscribe with PayPal
          </>
        )}
      </button>

      {/* Stripe — coming soon */}
      <div className="relative">
        <button
          type="button"
          disabled
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/4 py-3.5 text-sm font-bold text-white/30 cursor-not-allowed"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-4 w-4 shrink-0"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"
            />
          </svg>
          Subscribe with Stripe
        </button>
        <span className="absolute -top-2.5 right-3 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/50">
          Coming soon
        </span>
      </div>

      <a
        href="/invoice"
        className="text-center text-sm text-white/40 transition hover:text-white/70"
      >
        Keep using free
      </a>

      <p className="text-center text-[11px] text-white/25">
        Cancel anytime.{" "}
        <a
          href="https://discord.gg/rHjSC2cJpm"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 underline underline-offset-2 transition hover:text-white/50"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.031.057a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
          </svg>
          Questions? Join our Discord.
        </a>
      </p>
    </div>
  );
}
