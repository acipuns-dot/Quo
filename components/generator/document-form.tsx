"use client";

import React, { useMemo, useState } from "react";
import { documentSchema } from "../../lib/documents/schema";
import type { DocumentData, LineItem } from "../../lib/documents/types";
import { LogoUpload } from "./logo-upload";

type DocumentFormProps = {
  data: DocumentData;
  onChange: (next: DocumentData) => void;
};

type FieldErrors = Record<string, string>;

const labelClass =
  "text-xs font-semibold uppercase tracking-[0.12em] text-stone-400";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-300 focus:border-stone-400 focus:bg-white focus:outline-none";

function nextLineItemId(items: LineItem[]): string {
  return `line-${items.length + 1}`;
}

function buildErrors(data: DocumentData): FieldErrors {
  const result = documentSchema.safeParse(data);

  if (result.success) {
    return {};
  }

  return result.error.issues.reduce<FieldErrors>((errors, issue) => {
    const path = issue.path.join(".");

    if (!path || path in errors) {
      return errors;
    }

    errors[path] = issue.message;
    return errors;
  }, {});
}

function getNumericValue(value: string): number {
  if (value.trim() === "") {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function DocumentForm({ data, onChange }: DocumentFormProps) {
  const [logoError, setLogoError] = useState<string | null>(null);
  const errors = useMemo(() => buildErrors(data), [data]);

  function update<K extends keyof DocumentData>(key: K, value: DocumentData[K]) {
    onChange({ ...data, [key]: value });
  }

  function updateLineItem(
    index: number,
    key: keyof LineItem,
    value: LineItem[keyof LineItem],
  ) {
    const nextItems = data.lineItems.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [key]: value } : item,
    );

    update("lineItems", nextItems);
  }

  function addLineItem() {
    update("lineItems", [
      ...data.lineItems,
      {
        id: nextLineItemId(data.lineItems),
        description: "",
        note: "",
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  }

  function removeLineItem(index: number) {
    if (data.lineItems.length === 1) {
      return;
    }

    update(
      "lineItems",
      data.lineItems.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  const showLineItems = data.kind !== "receipt";

  return (
    <div className="space-y-5 rounded-3xl bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-400">
        Details
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className={labelClass}>Business name</span>
          <input
            aria-label="Business name"
            className={inputClass}
            value={data.businessName}
            onChange={(event) => update("businessName", event.target.value)}
          />
          {errors.businessName ? (
            <p className="mt-1.5 text-sm text-red-600">{errors.businessName}</p>
          ) : null}
        </label>

        <label className="block md:col-span-2">
          <span className={labelClass}>Business address</span>
          <textarea
            aria-label="Business address"
            rows={3}
            className={`${inputClass} resize-none`}
            value={data.businessAddress}
            onChange={(event) => update("businessAddress", event.target.value)}
          />
        </label>

        <label className="block md:col-span-2">
          <span className={labelClass}>Customer name</span>
          <input
            aria-label="Customer name"
            className={inputClass}
            value={data.customerName}
            onChange={(event) => update("customerName", event.target.value)}
          />
          {errors.customerName ? (
            <p className="mt-1.5 text-sm text-red-600">{errors.customerName}</p>
          ) : null}
        </label>

        <label className="block md:col-span-2">
          <span className={labelClass}>Customer address</span>
          <textarea
            aria-label="Customer address"
            rows={3}
            className={`${inputClass} resize-none`}
            value={data.customerAddress}
            onChange={(event) => update("customerAddress", event.target.value)}
          />
        </label>

        <label className="block">
          <span className={labelClass}>Document number</span>
          <input
            aria-label="Document number"
            className={inputClass}
            value={data.documentNumber}
            onChange={(event) => update("documentNumber", event.target.value)}
          />
          {errors.documentNumber ? (
            <p className="mt-1.5 text-sm text-red-600">
              {errors.documentNumber}
            </p>
          ) : null}
        </label>

        <label className="block">
          <span className={labelClass}>Document date</span>
          <input
            aria-label="Document date"
            type="text"
            inputMode="numeric"
            placeholder="YYYY-MM-DD"
            className={inputClass}
            value={data.documentDate}
            onChange={(event) => update("documentDate", event.target.value)}
          />
          {errors.documentDate ? (
            <p className="mt-1.5 text-sm text-red-600">{errors.documentDate}</p>
          ) : null}
        </label>

        <label className="block">
          <span className={labelClass}>Currency</span>
          <input
            aria-label="Currency"
            className={inputClass}
            value={data.currency}
            onChange={(event) =>
              update("currency", event.target.value.toUpperCase())
            }
          />
          {errors.currency ? (
            <p className="mt-1.5 text-sm text-red-600">{errors.currency}</p>
          ) : null}
        </label>

        {showLineItems ? (
          <>
            <label className="block">
              <span className={labelClass}>Tax label</span>
              <input
                aria-label="Tax label"
                className={inputClass}
                value={data.taxLabel}
                onChange={(event) => update("taxLabel", event.target.value)}
              />
              {errors.taxLabel ? (
                <p className="mt-1.5 text-sm text-red-600">{errors.taxLabel}</p>
              ) : null}
            </label>

            <label className="block">
              <span className={labelClass}>Tax rate</span>
              <input
                aria-label="Tax rate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                className={inputClass}
                value={String(data.taxRate)}
                onChange={(event) =>
                  update("taxRate", getNumericValue(event.target.value))
                }
              />
              {errors.taxRate ? (
                <p className="mt-1.5 text-sm text-red-600">{errors.taxRate}</p>
              ) : null}
            </label>
          </>
        ) : (
          <>
            <label className="block">
              <span className={labelClass}>Payment method</span>
              <input
                aria-label="Payment method"
                className={inputClass}
                value={data.paymentMethod}
                onChange={(event) => update("paymentMethod", event.target.value)}
              />
            </label>

            <label className="block">
              <span className={labelClass}>Amount received</span>
              <input
                aria-label="Amount received"
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={String(data.amountReceived)}
                onChange={(event) =>
                  update("amountReceived", getNumericValue(event.target.value))
                }
              />
              {errors.amountReceived ? (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.amountReceived}
                </p>
              ) : null}
            </label>
          </>
        )}

        <label className="block md:col-span-2">
          <span className={labelClass}>Notes</span>
          <textarea
            aria-label="Notes"
            rows={4}
            className={`${inputClass} resize-none`}
            value={data.notes}
            onChange={(event) => update("notes", event.target.value)}
          />
        </label>
      </div>

      {showLineItems ? (
        <div className="space-y-4 rounded-2xl border border-stone-200 bg-stone-50/80 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-400">
              Line items
            </p>
            <button
              type="button"
              onClick={addLineItem}
              className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 hover:border-stone-400"
            >
              Add line item
            </button>
          </div>

          {data.lineItems.map((item, index) => (
            <div
              key={item.id}
              data-testid={`line-item-card-${index}`}
              className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4"
            >
              <label className="block">
                <span className={labelClass}>Description</span>
                <input
                  aria-label={`Line item ${index + 1} description`}
                  className={inputClass}
                  value={item.description}
                  onChange={(event) =>
                    updateLineItem(index, "description", event.target.value)
                  }
                />
                {errors[`lineItems.${index}.description`] ? (
                  <p className="mt-1.5 text-sm text-red-600">
                    {errors[`lineItems.${index}.description`]}
                  </p>
                ) : null}
              </label>

              <label className="block">
                <span className={labelClass}>Line item note</span>
                <textarea
                  aria-label={`Line item ${index + 1} note`}
                  rows={3}
                  className={`${inputClass} resize-none`}
                  value={item.note}
                  onChange={(event) =>
                    updateLineItem(index, "note", event.target.value)
                  }
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className={labelClass}>Qty</span>
                  <input
                    aria-label={`Line item ${index + 1} quantity`}
                    type="number"
                    min="0"
                    step="0.01"
                    className={inputClass}
                    value={String(item.quantity)}
                    onChange={(event) =>
                      updateLineItem(
                        index,
                        "quantity",
                        getNumericValue(event.target.value),
                      )
                    }
                  />
                  {errors[`lineItems.${index}.quantity`] ? (
                    <p className="mt-1.5 text-sm text-red-600">
                      {errors[`lineItems.${index}.quantity`]}
                    </p>
                  ) : null}
                </label>

                <label className="block">
                  <span className={labelClass}>Unit price</span>
                  <input
                    aria-label={`Line item ${index + 1} unit price`}
                    type="number"
                    min="0"
                    step="0.01"
                    className={inputClass}
                    value={String(item.unitPrice)}
                    onChange={(event) =>
                      updateLineItem(
                        index,
                        "unitPrice",
                        getNumericValue(event.target.value),
                      )
                    }
                  />
                  {errors[`lineItems.${index}.unitPrice`] ? (
                    <p className="mt-1.5 text-sm text-red-600">
                      {errors[`lineItems.${index}.unitPrice`]}
                    </p>
                  ) : null}
                </label>
              </div>

              <div
                data-testid={`line-item-actions-${index}`}
                className="flex items-end"
              >
                <button
                  type="button"
                  onClick={() => removeLineItem(index)}
                  disabled={data.lineItems.length === 1}
                  className="w-full rounded-full border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 hover:border-stone-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {errors.lineItems ? (
            <p className="text-sm text-red-600">{errors.lineItems}</p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-1.5">
        <span className={labelClass}>Logo</span>
        <LogoUpload
          value={data.logoDataUrl}
          error={logoError}
          onChange={(value) => update("logoDataUrl", value)}
          onErrorChange={setLogoError}
        />
      </div>
    </div>
  );
}
