"use client";

import React, { useEffect, useState } from "react";
import { createBusiness, updateBusiness } from "../../lib/workspace/api-client";
import type { BusinessRecord } from "../../lib/workspace/types";
import { ModalShell } from "./modal-shell";

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#d4901e] focus:outline-none focus:ring-2 focus:ring-[#d4901e]/20";

const emptyBusinessValues = {
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

export function BusinessFormModal({
  open,
  mode,
  initialBusiness,
  onClose,
  onSaved,
}: {
  open: boolean;
  mode: "create" | "edit";
  initialBusiness?: BusinessRecord | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [values, setValues] = useState(emptyBusinessValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (mode === "edit" && initialBusiness) {
      setValues({
        name: initialBusiness.name,
        address: initialBusiness.address,
        email: initialBusiness.email,
        phone: initialBusiness.phone,
        taxNumber: initialBusiness.taxNumber,
        defaultCurrency: initialBusiness.defaultCurrency,
        defaultTaxLabel: initialBusiness.defaultTaxLabel,
        defaultTaxRate: initialBusiness.defaultTaxRate,
        defaultPaymentTerms: initialBusiness.defaultPaymentTerms,
        logoUrl: initialBusiness.logoUrl ?? "",
        notes: initialBusiness.notes,
      });
    } else {
      setValues(emptyBusinessValues);
    }

    setError(null);
    setIsSubmitting(false);
  }, [initialBusiness, mode, open]);

  function update<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...values,
        logoUrl: values.logoUrl.trim() || null,
      };

      if (mode === "create") {
        await createBusiness(payload);
      } else if (initialBusiness) {
        await updateBusiness(initialBusiness.id, payload);
      }

      await onSaved();
      onClose();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save business.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Add business" : "Edit business"}
      description="Manage the business details used across your workspace."
    >
      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
            Business name
          </span>
          <input
            aria-label="Business name"
            required
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            className={inputClass}
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
            className={inputClass}
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
            className={inputClass}
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
            className={inputClass}
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
            className={inputClass}
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
            className={inputClass}
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
            className={inputClass}
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
            className={inputClass}
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
            className={inputClass}
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
            className={inputClass}
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
            className={inputClass}
            placeholder="Optional business notes"
          />
        </label>
        {error ? (
          <div className="md:col-span-2 rounded-2xl border border-[#dc2626]/30 bg-[#dc2626]/10 px-4 py-3 text-sm text-[#fecaca]">
            {error}
          </div>
        ) : null}
        <div className="md:col-span-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/75"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl bg-[#d4901e] px-5 py-3 text-sm font-bold text-[#111111] disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : mode === "create" ? "Create business" : "Save business"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
