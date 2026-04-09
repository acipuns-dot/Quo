"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

type FirstBusinessOnboardingProps = {
  kind: "quotation" | "invoice" | "receipt";
};

const defaultValues = {
  name: "",
  address: "",
  email: "",
  phone: "",
  taxNumber: "",
  defaultCurrency: "USD",
  defaultTaxLabel: "Tax",
  defaultTaxRate: 0,
  defaultPaymentTerms: "",
  logoUrl: "",
  notes: "",
};

export function FirstBusinessOnboarding({ kind }: FirstBusinessOnboardingProps) {
  const router = useRouter();
  const [values, setValues] = useState(defaultValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/workspace/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          logoUrl: values.logoUrl.trim() ? values.logoUrl.trim() : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to create your first business right now.");
      }

      const payload = (await response.json()) as { item: { id: string } };
      router.push(`/workspace/${kind}?businessId=${payload.item.id}`);
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to create your first business right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function update<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <main className="min-h-screen bg-[#111111] px-6 py-16 text-[#faf9f7]">
      <section className="mx-auto max-w-3xl rounded-[32px] border border-white/[0.08] bg-[#18120d] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:p-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#d4901e]/30 bg-[#d4901e]/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d4901e]">
          Premium setup
        </div>

        <h1 className="mt-8 text-4xl font-extrabold tracking-[-0.04em] text-white md:text-5xl">
          Set up your first business
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-white/58">
          Add your business details once so Quo Premium can save customers, documents, and
          defaults inside your workspace.
        </p>

        <form className="mt-10 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              Business name
            </span>
            <input
              aria-label="Business name"
              required
              value={values.name}
              onChange={(event) => update("name", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#d4901e] focus:outline-none focus:ring-2 focus:ring-[#d4901e]/20"
              placeholder="Quo Studio"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              Address
            </span>
            <textarea
              aria-label="Address"
              rows={3}
              value={values.address}
              onChange={(event) => update("address", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#d4901e] focus:outline-none focus:ring-2 focus:ring-[#d4901e]/20"
              placeholder="10 Main Street"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              Email
            </span>
            <input
              aria-label="Email"
              type="email"
              value={values.email}
              onChange={(event) => update("email", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#d4901e] focus:outline-none focus:ring-2 focus:ring-[#d4901e]/20"
              placeholder="owner@example.com"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              Phone
            </span>
            <input
              aria-label="Phone"
              value={values.phone}
              onChange={(event) => update("phone", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#d4901e] focus:outline-none focus:ring-2 focus:ring-[#d4901e]/20"
              placeholder="+60 12-345 6789"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              Tax number
            </span>
            <input
              aria-label="Tax number"
              value={values.taxNumber}
              onChange={(event) => update("taxNumber", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#d4901e] focus:outline-none focus:ring-2 focus:ring-[#d4901e]/20"
              placeholder="TAX-001"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              Default currency
            </span>
            <input
              aria-label="Default currency"
              required
              value={values.defaultCurrency}
              onChange={(event) => update("defaultCurrency", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#d4901e] focus:outline-none focus:ring-2 focus:ring-[#d4901e]/20"
              placeholder="USD"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              Default tax label
            </span>
            <input
              aria-label="Default tax label"
              value={values.defaultTaxLabel}
              onChange={(event) => update("defaultTaxLabel", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#d4901e] focus:outline-none focus:ring-2 focus:ring-[#d4901e]/20"
              placeholder="Tax"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              Default tax rate
            </span>
            <input
              aria-label="Default tax rate"
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={values.defaultTaxRate}
              onChange={(event) => update("defaultTaxRate", Number(event.target.value))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#d4901e] focus:outline-none focus:ring-2 focus:ring-[#d4901e]/20"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              Default payment terms
            </span>
            <input
              aria-label="Default payment terms"
              value={values.defaultPaymentTerms}
              onChange={(event) => update("defaultPaymentTerms", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#d4901e] focus:outline-none focus:ring-2 focus:ring-[#d4901e]/20"
              placeholder="Net 30"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              Logo URL
            </span>
            <input
              aria-label="Logo URL"
              value={values.logoUrl}
              onChange={(event) => update("logoUrl", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#d4901e] focus:outline-none focus:ring-2 focus:ring-[#d4901e]/20"
              placeholder="https://example.com/logo.png"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              Notes
            </span>
            <textarea
              aria-label="Notes"
              rows={4}
              value={values.notes}
              onChange={(event) => update("notes", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#d4901e] focus:outline-none focus:ring-2 focus:ring-[#d4901e]/20"
              placeholder="Optional business notes"
            />
          </label>

          {error ? (
            <div className="md:col-span-2 rounded-2xl border border-[#dc2626]/30 bg-[#dc2626]/10 px-4 py-3 text-sm text-[#fecaca]">
              {error}
            </div>
          ) : null}

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-[#d4901e] px-5 py-3 text-sm font-bold text-[#111111] shadow-[0_10px_30px_rgba(212,144,30,0.28)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creating..." : "Create business"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
