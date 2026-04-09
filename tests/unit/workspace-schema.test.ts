import { describe, expect, it } from "vitest";
import {
  businessRecordSchema,
  customerRecordSchema,
  savedDocumentRecordSchema,
} from "../../lib/workspace/schema";

describe("workspace schemas", () => {
  it("accepts a business with richer defaults", () => {
    const result = businessRecordSchema.safeParse({
      id: "biz_1",
      userId: "user_1",
      name: "Quo Studio",
      address: "10 Main Street",
      email: "owner@example.com",
      phone: "123",
      taxNumber: "TAX-22",
      defaultCurrency: "USD",
      defaultTaxLabel: "Tax",
      defaultTaxRate: 6,
      defaultPaymentTerms: "Net 30",
      logoUrl: null,
      notes: "Main business",
      createdAt: "2026-04-08T00:00:00.000Z",
      updatedAt: "2026-04-08T00:00:00.000Z",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a customer without a business id", () => {
    const result = customerRecordSchema.safeParse({
      id: "cust_1",
      businessId: "",
      name: "Acme",
      address: "88 River Road",
      email: "",
      phone: "",
      taxNumber: "",
      notes: "",
      createdAt: "2026-04-08T00:00:00.000Z",
      updatedAt: "2026-04-08T00:00:00.000Z",
    });

    expect(result.success).toBe(false);
  });

  it("accepts a saved document with draft status", () => {
    const result = savedDocumentRecordSchema.safeParse({
      id: "doc_1",
      businessId: "biz_1",
      customerId: "cust_1",
      kind: "invoice",
      status: "draft",
      documentNumber: "INV-2026-0001",
      issueDate: "2026-04-08",
      payloadVersion: 1,
      payload: {
        kind: "invoice",
        businessName: "Quo Studio",
        businessAddress: "10 Main Street",
        logoDataUrl: "",
        customerName: "Acme",
        customerAddress: "88 River Road",
        documentNumber: "INV-2026-0001",
        documentDate: "2026-04-08",
        validUntil: "",
        paymentTerms: "Net 30",
        currency: "USD",
        taxLabel: "Tax",
        taxRate: 6,
        paymentMethod: "",
        amountReceived: 0,
        notes: "",
        templateId: "clean",
        themeId: "slate",
        lineItems: [{ id: "line-1", description: "A", note: "", quantity: 1, unitPrice: 10 }],
      },
      createdAt: "2026-04-08T00:00:00.000Z",
      updatedAt: "2026-04-08T00:00:00.000Z",
    });

    expect(result.success).toBe(true);
  });
});
