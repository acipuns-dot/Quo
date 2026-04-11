"use client";

import React, { useEffect, useState } from "react";
import { createCustomer, updateCustomer } from "../../lib/workspace/api-client";
import type { CustomerRecord } from "../../lib/workspace/types";
import { ModalShell } from "./modal-shell";

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#d4901e] focus:outline-none focus:ring-2 focus:ring-[#d4901e]/20";

const emptyCustomerValues = {
  name: "",
  address: "",
  email: "",
  phone: "",
  taxNumber: "",
  notes: "",
};

export function CustomerFormModal({
  open,
  businessId,
  mode,
  initialCustomer,
  onClose,
  onSaved,
}: {
  open: boolean;
  businessId: string;
  mode: "create" | "edit";
  initialCustomer?: CustomerRecord | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [values, setValues] = useState(emptyCustomerValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (mode === "edit" && initialCustomer) {
      setValues({
        name: initialCustomer.name,
        address: initialCustomer.address,
        email: initialCustomer.email,
        phone: initialCustomer.phone,
        taxNumber: initialCustomer.taxNumber,
        notes: initialCustomer.notes,
      });
    } else {
      setValues(emptyCustomerValues);
    }

    setError(null);
    setIsSubmitting(false);
  }, [initialCustomer, mode, open]);

  function update<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === "create") {
        await createCustomer(businessId, values);
      } else if (initialCustomer) {
        await updateCustomer(businessId, initialCustomer.id, values);
      }

      await onSaved();
      onClose();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save customer.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Add customer" : "Edit customer"}
      description="Save repeat customer details for this business."
    >
      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
            Customer name
          </span>
          <input
            aria-label="Customer name"
            required
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            className={inputClass}
            placeholder="Ada Lovelace"
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
            placeholder="ada@example.com"
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
            placeholder="CUST-001"
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
            placeholder="Optional customer notes"
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
            {isSubmitting ? "Saving..." : mode === "create" ? "Create customer" : "Save customer"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
