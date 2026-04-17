"use client";

import React, { useEffect, useState } from "react";
import type { LineItem } from "../../lib/documents/types";
import { createItem, updateItem } from "../../lib/workspace/api-client";
import type { ItemRecord } from "../../lib/workspace/types";
import { LineItemUnitDropdown } from "../generator/line-item-unit-dropdown";
import { ModalShell } from "./modal-shell";

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus:border-[#d4901e] focus:outline-none focus:ring-2 focus:ring-[#d4901e]/20";

const emptyItemValues = {
  name: "",
  description: "",
  quantity: 1,
  unit: "" as LineItem["unit"],
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
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
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
        <div className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-white/35">
              Item 1
            </span>
          </div>
          <label className="block">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40 mb-1">
              Description
            </span>
            <input
              aria-label="Description"
              value={values.description}
              onChange={(event) => update("description", event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-[#faf9f7] placeholder:text-white/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus:border-[#d4901e]/60 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-[#d4901e]/15"
              placeholder="Optional"
            />
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            <label className="block">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40 mb-1">
                Qty
              </span>
              <input
                aria-label="Quantity"
                type="number"
                min="0"
                step="0.01"
                value={String(values.quantity)}
                onChange={(event) => update("quantity", Number(event.target.value) || 0)}
                className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-[#faf9f7] placeholder:text-white/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus:border-[#d4901e]/60 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-[#d4901e]/15"
              />
            </label>
            <label className="block">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40 mb-1">
                Unit
              </span>
              <LineItemUnitDropdown
                ariaLabel="Unit"
                value={values.unit}
                onSelect={(value) => {
                  update("unit", value);
                  if (value !== "custom") {
                    update("customUnit", "");
                  }
                }}
                buttonClassName="w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-[#faf9f7] placeholder:text-white/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus:border-[#d4901e]/60 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-[#d4901e]/15"
              />
            </label>
            <label className="block">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40 mb-1">
                Unit price
              </span>
              <input
                aria-label="Unit price"
                type="number"
                min="0"
                step="0.01"
                value={String(values.unitPrice)}
                onChange={(event) => update("unitPrice", Number(event.target.value) || 0)}
                className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-[#faf9f7] placeholder:text-white/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus:border-[#d4901e]/60 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-[#d4901e]/15"
              />
            </label>
          </div>
          {values.unit === "custom" ? (
            <label className="block">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40 mb-1">
                Custom unit
              </span>
              <input
                aria-label="Custom unit"
                value={values.customUnit}
                onChange={(event) => update("customUnit", event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-[#faf9f7] placeholder:text-white/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus:border-[#d4901e]/60 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-[#d4901e]/15"
              />
            </label>
          ) : null}
        </div>
        {error ? (
          <div className="rounded-2xl border border-[#dc2626]/30 bg-[#dc2626]/10 px-4 py-3 text-sm text-[#fecaca]">
            {error}
          </div>
        ) : null}
        <div className="flex justify-end gap-3">
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
