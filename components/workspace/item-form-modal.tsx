"use client";

import React, { useEffect, useState } from "react";
import { createItem, updateItem } from "../../lib/workspace/api-client";
import type { ItemRecord } from "../../lib/workspace/types";
import { ModalShell } from "./modal-shell";

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#d4901e] focus:outline-none focus:ring-2 focus:ring-[#d4901e]/20";

const emptyItemValues = {
  name: "",
  description: "",
  note: "",
  quantity: 1,
  unit: "",
  customUnit: "",
  unitPrice: 0,
};

export function ItemFormModal({
  open,
  businessId,
  mode,
  initialItem,
  onClose,
  onSaved,
}: {
  open: boolean;
  businessId: string;
  mode: "create" | "edit";
  initialItem?: ItemRecord | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [values, setValues] = useState(emptyItemValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (mode === "edit" && initialItem) {
      setValues({
        name: initialItem.name,
        description: initialItem.description,
        note: initialItem.note,
        quantity: initialItem.quantity,
        unit: initialItem.unit,
        customUnit: initialItem.customUnit,
        unitPrice: initialItem.unitPrice,
      });
    } else {
      setValues(emptyItemValues);
    }

    setError(null);
    setIsSubmitting(false);
  }, [initialItem, mode, open]);

  function update<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === "create") {
        await createItem(businessId, values);
      } else if (initialItem) {
        await updateItem(businessId, initialItem.id, values);
      }

      await onSaved();
      onClose();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save item.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Add item" : "Edit item"}
      description="Save reusable line items for this business."
    >
      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
            Item name
          </span>
          <input
            aria-label="Item name"
            required
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            className={inputClass}
            placeholder="Website copywriting"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
            Description
          </span>
          <input
            aria-label="Description"
            required
            value={values.description}
            onChange={(event) => update("description", event.target.value)}
            className={inputClass}
            placeholder="Landing page copy"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
            Note
          </span>
          <textarea
            aria-label="Note"
            rows={3}
            value={values.note}
            onChange={(event) => update("note", event.target.value)}
            className={inputClass}
            placeholder="Optional delivery or scope notes"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
            Quantity
          </span>
          <input
            aria-label="Quantity"
            type="number"
            min="0"
            step="0.01"
            value={String(values.quantity)}
            onChange={(event) => update("quantity", Number(event.target.value) || 0)}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
            Unit
          </span>
          <input
            aria-label="Unit"
            value={values.unit}
            onChange={(event) => update("unit", event.target.value)}
            className={inputClass}
            placeholder="service"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
            Custom unit
          </span>
          <input
            aria-label="Custom unit"
            value={values.customUnit}
            onChange={(event) => update("customUnit", event.target.value)}
            className={inputClass}
            placeholder="Only when unit is custom"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
            Unit price
          </span>
          <input
            aria-label="Unit price"
            type="number"
            min="0"
            step="0.01"
            value={String(values.unitPrice)}
            onChange={(event) => update("unitPrice", Number(event.target.value) || 0)}
            className={inputClass}
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
            {isSubmitting ? "Saving..." : mode === "create" ? "Create item" : "Save item"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
