import { describe, expect, it } from "vitest";
import { createDefaultDocument } from "../../lib/documents/defaults";
import { paginateDocument } from "../../lib/documents/pagination";

function buildLineItems(count: number, withNotes = false) {
  return Array.from({ length: count }, (_, index) => ({
    id: `line-${index + 1}`,
    description: `Service ${index + 1}`,
    note: withNotes ? `Implementation note ${index + 1}` : "",
    quantity: 1,
    unitPrice: 100,
  }));
}

// 8 short-noted items: weight = 1.0 + 7×1.45 = 11.15
// Fits classic/edge compact (capacity ~11.8) but NOT modern compact (capacity ~12.5 - reserve)
function buildSharedOverflowInvoice() {
  return {
    ...createDefaultDocument("invoice"),
    templateId: "default",
    notes: "",
    lineItems: [
      { id: "line-1", description: "Design service", note: "", quantity: 1, unitPrice: 250 },
      { id: "line-2", description: "asdsad", note: "asda", quantity: 1, unitPrice: 0 },
      { id: "line-3", description: "sadas", note: "sadasda", quantity: 1, unitPrice: 0 },
      { id: "line-4", description: "asdad", note: "sadasd", quantity: 1, unitPrice: 0 },
      { id: "line-5", description: "asdada", note: "sadadas", quantity: 1, unitPrice: 0 },
      { id: "line-6", description: "asdas", note: "sadasdas", quantity: 1, unitPrice: 0 },
      { id: "line-7", description: "asdada", note: "sadadsa", quantity: 1, unitPrice: 0 },
      { id: "line-8", description: "asdasd", note: "sadasda", quantity: 1, unitPrice: 0 },
    ],
  };
}

// 9 short-noted items: weight = 1.0 + 8×1.45 = 12.6 — overflows modern compact (capacity 12.5)
function buildModernOverflowInvoice() {
  return {
    ...buildSharedOverflowInvoice(),
    lineItems: [
      ...buildSharedOverflowInvoice().lineItems,
      { id: "line-9", description: "qweqwe", note: "qweqweq", quantity: 1, unitPrice: 0 },
    ],
  };
}

describe("paginateDocument", () => {
  it("keeps a short invoice in comfortable single-page mode", () => {
    const data = {
      ...createDefaultDocument("invoice"),
      lineItems: buildLineItems(3),
    };

    const result = paginateDocument(data);

    expect(result.layoutMode).toBe("comfortable");
    expect(result.pages).toHaveLength(1);
    expect(result.pages[0]?.isFirstPage).toBe(true);
    expect(result.pages[0]?.isFinalPage).toBe(true);
    expect(result.pages[0]?.lineItems).toHaveLength(3);
  });

  it("switches to compact mode before creating a second page", () => {
    const data = {
      ...createDefaultDocument("quotation"),
      lineItems: buildLineItems(9, true),
      notes: "Thank you for the opportunity.",
    };

    const result = paginateDocument(data);

    expect(result.layoutMode).toBe("compact");
    expect(result.pages).toHaveLength(1);
    expect(result.pages[0]?.showTotals).toBe(true);
  });

  it("splits a larger invoice across continuation pages and reserves the final page footer content", () => {
    const data = {
      ...createDefaultDocument("invoice"),
      lineItems: buildLineItems(18, true),
      notes: "Payment due within 14 days.",
    };

    const result = paginateDocument(data);

    expect(result.layoutMode).toBe("compact");
    expect(result.pages.length).toBeGreaterThan(1);
    expect(result.pages[0]?.showTotals).toBe(false);
    expect(result.pages.at(-1)?.showTotals).toBe(true);
    expect(result.pages[1]?.isContinuationPage).toBe(true);
  });

  it("reserves final-page space for the no-signature-required notice even without notes", () => {
    const result = paginateDocument({
      ...createDefaultDocument("invoice"),
      lineItems: buildLineItems(15),
      notes: "",
    });

    expect(result.pages).toHaveLength(2);
    expect(result.pages[0]?.showNotes).toBe(false);
    expect(result.pages.at(-1)?.showNotes).toBe(true);
  });

  it("creates a continuation page for dense compact invoices before totals overflow the first page", () => {
    const result = paginateDocument({
      ...createDefaultDocument("invoice"),
      currency: "MYR",
      documentNumber: "INV-20260408",
      documentDate: "2026-04-08",
      validUntil: "2026-05-08",
      paymentTerms: "Full",
      taxLabel: "SST",
      taxRate: 6,
      notes: "Full Payment Only",
      lineItems: [
        {
          id: "line-1",
          description: "Design Service",
          note: "Full design service for frontend with extra review",
          quantity: 1,
          unitPrice: 6000,
        },
        {
          id: "line-2",
          description: "Web Service",
          note: "Fully backend from hestier to database",
          quantity: 1,
          unitPrice: 4000,
        },
        {
          id: "line-3",
          description: "Labour Charge",
          note: "In house development team",
          quantity: 3,
          unitPrice: 1500,
        },
        {
          id: "line-4",
          description: "Extra charge",
          note: "Supabase, Firebase and FCM",
          quantity: 1,
          unitPrice: 800,
        },
        {
          id: "line-5",
          description: "dsadsadsadas",
          note: "asdadadsda",
          quantity: 1,
          unitPrice: 0,
        },
        {
          id: "line-6",
          description: "sadasdasdaa",
          note: "",
          quantity: 1,
          unitPrice: 0,
        },
        {
          id: "line-7",
          description: "",
          note: "",
          quantity: 1,
          unitPrice: 0,
        },
      ],
    });

    expect(result.layoutMode).toBe("compact");
    expect(result.pages).toHaveLength(1);
    expect(result.pages[0]?.showTotals).toBe(true);
  });

  it("ignores blank draft line items when paginating invoices", () => {
    const result = paginateDocument({
      ...createDefaultDocument("invoice"),
      lineItems: [
        {
          id: "line-1",
          description: "Design service",
          note: "",
          quantity: 1,
          unitPrice: 250,
        },
        ...Array.from({ length: 6 }, (_, index) => ({
          id: `draft-${index + 1}`,
          description: "",
          note: "",
          quantity: 1,
          unitPrice: 0,
        })),
      ],
    });

    expect(result.pages).toHaveLength(1);
    expect(result.pages[0]?.lineItems).toHaveLength(1);
  });

  it("breaks earlier for the modern invoice template when the final totals block would overflow", () => {
    const result = paginateDocument(buildModernOverflowInvoice());

    expect(result.pages).toHaveLength(2);
    expect(result.pages[0]?.showTotals).toBe(false);
    expect(result.pages[1]?.showTotals).toBe(true);
  });

  it("does not force the same early break for classic invoices with the same rows", () => {
    const result = paginateDocument({
      ...buildSharedOverflowInvoice(),
      templateId: "classic",
    });

    expect(result.pages).toHaveLength(1);
    expect(result.pages[0]?.showTotals).toBe(true);
  });

  it("breaks earlier for the classic invoice template when the final totals block would overflow", () => {
    const result = paginateDocument({
      ...buildSharedOverflowInvoice(),
      templateId: "classic",
      notes: "Full Payment Only",
    });

    expect(result.pages).toHaveLength(2);
    expect(result.pages[0]?.showTotals).toBe(false);
    expect(result.pages[1]?.showTotals).toBe(true);
  });

  it("switches to compact mode for a payment-terms invoice that would overflow comfortable layout", () => {
    // 3 noted items + payment terms + notes: totals block is too tall for comfortable
    // but fits on one compact page — paginator must switch rather than staying comfortable and overflowing.
    const result = paginateDocument({
      ...createDefaultDocument("invoice"),
      templateId: "default",
      paymentTermPreset: "half",
      paymentTermPercentage: 50,
      notes: "For Payment Reference\n\nCIMB\n7620001984\nMohamad zulfadhly",
      lineItems: [
        { id: "line-1", description: "AISKRIM KON", note: "Vanilla cone", quantity: 1, unitPrice: 83 },
        { id: "line-2", description: "sadsadasdasd", note: "saddsadsadsa", quantity: 1, unitPrice: 0 },
        { id: "line-3", description: "dsadasadsasd", note: "asdadadasdas", quantity: 1, unitPrice: 0 },
      ],
    });

    // Must NOT stay in comfortable — that would overflow the page visually
    expect(result.layoutMode).toBe("compact");
    // Compact has enough reserve; all items + totals fit on one page
    expect(result.pages).toHaveLength(1);
    expect(result.pages[0]?.showTotals).toBe(true);
  });

  it("breaks earlier for the edge invoice template when the final totals block would overflow", () => {
    const result = paginateDocument({
      ...buildSharedOverflowInvoice(),
      templateId: "edge",
      notes: "Full Payment Only",
    });

    expect(result.pages).toHaveLength(2);
    expect(result.pages[0]?.showTotals).toBe(false);
    expect(result.pages[1]?.showTotals).toBe(true);
  });
});
