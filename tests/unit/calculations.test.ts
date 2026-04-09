import { describe, expect, it } from "vitest";
import { calculateDocumentTotals, getPaymentTermSummary } from "../../lib/documents/calculations";
import { createDefaultDocument } from "../../lib/documents/defaults";
import { formatCurrency } from "../../lib/documents/format";

describe("calculateDocumentTotals", () => {
  it("computes subtotal, tax amount, and total", () => {
    const payload = createDefaultDocument("invoice");
    payload.taxRate = 6;
    payload.lineItems = [
      { id: "1", description: "A", note: "", quantity: 2, unitPrice: 50 },
      { id: "2", description: "B", note: "", quantity: 1, unitPrice: 100 },
    ];

    expect(calculateDocumentTotals(payload)).toEqual({
      subtotal: 200,
      taxAmount: 12,
      total: 212,
    });
  });

  it("rounds 10.075 up to 10.08 before tax is applied", () => {
    const payload = createDefaultDocument("quotation");
    payload.taxRate = 0;
    payload.lineItems = [
      { id: "1", description: "A", note: "", quantity: 1, unitPrice: 10.075 },
    ];

    expect(calculateDocumentTotals(payload)).toEqual({
      subtotal: 10.08,
      taxAmount: 0,
      total: 10.08,
    });
  });

  it("computes totals for multiple items with tax", () => {
    const payload = createDefaultDocument("invoice");
    payload.taxRate = 7.5;
    payload.lineItems = [
      { id: "1", description: "A", note: "", quantity: 2, unitPrice: 25 },
      { id: "2", description: "B", note: "", quantity: 3, unitPrice: 10.075 },
    ];

    expect(calculateDocumentTotals(payload)).toEqual({
      subtotal: 80.23,
      taxAmount: 6.02,
      total: 86.25,
    });
  });

  it("supports fractional quantities", () => {
    const payload = createDefaultDocument("quotation");
    payload.taxRate = 0;
    payload.lineItems = [
      { id: "1", description: "A", note: "", quantity: 1.5, unitPrice: 10 },
    ];

    expect(calculateDocumentTotals(payload)).toEqual({
      subtotal: 15,
      taxAmount: 0,
      total: 15,
    });
  });

  it("handles scientific-notation inputs", () => {
    const payload = createDefaultDocument("invoice");
    payload.taxRate = 0;
    payload.lineItems = [
      { id: "1", description: "A", note: "", quantity: 1e-7, unitPrice: 100000000 },
    ];

    expect(calculateDocumentTotals(payload)).toEqual({
      subtotal: 10,
      taxAmount: 0,
      total: 10,
    });
  });
});

describe("getPaymentTermSummary", () => {
  it("returns a full-payment summary for 100 percent presets", () => {
    const payload = {
      ...createDefaultDocument("invoice"),
      paymentTermPreset: "full" as const,
      paymentTermPercentage: 100,
      taxRate: 0,
    };

    expect(getPaymentTermSummary(payload)).toEqual({
      label: "Full payment (100%)",
      percentage: 100,
      amountDue: 250,
    });
  });

  it("returns a half-payment summary from the grand total", () => {
    const payload = {
      ...createDefaultDocument("invoice"),
      paymentTermPreset: "half" as const,
      paymentTermPercentage: 50,
      taxRate: 10,
    };

    expect(getPaymentTermSummary(payload)).toEqual({
      label: "Half payment (50%)",
      percentage: 50,
      amountDue: 137.5,
    });
  });

  it("returns null when no structured payment term is selected", () => {
    expect(getPaymentTermSummary(createDefaultDocument("invoice"))).toBeNull();
  });
});

describe("formatCurrency", () => {
  it("formats positive amounts using the supported US locale", () => {
    expect(formatCurrency(1234.5, "USD")).toBe("$1,234.50");
  });

  it("keeps the en-US thousands separator and decimal style for other currencies", () => {
    expect(formatCurrency(1234.56, "EUR")).toBe("\u20AC1,234.56");
  });

  it("formats negative values with the en-US sign placement", () => {
    expect(formatCurrency(-10.5, "USD")).toBe("-$10.50");
  });

  it("does not throw when the currency code is incomplete while typing", () => {
    expect(() => formatCurrency(1234.5, "M")).not.toThrow();
    expect(formatCurrency(1234.5, "M")).toBe("1,234.50");
  });
});
