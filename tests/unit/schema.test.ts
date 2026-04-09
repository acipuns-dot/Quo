import { describe, expect, it } from "vitest";
import { documentSchema } from "../../lib/documents/schema";
import { createDefaultDocument } from "../../lib/documents/defaults";

describe("documentSchema", () => {
  it("accepts a valid invoice payload", () => {
    const result = documentSchema.safeParse(createDefaultDocument("invoice"));
    expect(result.success).toBe(true);
  });

  it("provides empty structured payment term defaults for invoices", () => {
    const payload = createDefaultDocument("invoice");

    expect(payload.paymentTermPreset).toBe("");
    expect(payload.paymentTermPercentage).toBeNull();
    expect(payload.paymentTermLabel).toBe("");
  });

  it("rejects negative quantity values", () => {
    const payload = createDefaultDocument("quotation");
    payload.lineItems[0].quantity = -1;
    const result = documentSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => {
        return issue.path.length === 3 &&
          issue.path[0] === "lineItems" &&
          issue.path[1] === 0 &&
          issue.path[2] === "quantity";
      })).toBe(true);
    }
  });

  it("rejects invalid calendar dates", () => {
    const payload = createDefaultDocument("invoice");
    payload.documentDate = "2026-02-30";

    const result = documentSchema.safeParse(payload);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => {
        return issue.path.length === 1 &&
          issue.path[0] === "documentDate" &&
          issue.message === "Enter a valid date.";
      })).toBe(true);
    }
  });

  it("accepts a preset payment term with fixed percentage", () => {
    const payload = {
      ...createDefaultDocument("invoice"),
      paymentTermPreset: "half",
      paymentTermPercentage: 50,
    };

    expect(documentSchema.safeParse(payload).success).toBe(true);
  });

  it("rejects a custom payment term percentage above 100", () => {
    const payload = {
      ...createDefaultDocument("invoice"),
      paymentTermPreset: "custom",
      paymentTermPercentage: 120,
    };

    const result = documentSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("rejects mismatched preset and percentage", () => {
    const payload = {
      ...createDefaultDocument("invoice"),
      paymentTermPreset: "half",
      paymentTermPercentage: 30,
    };

    const result = documentSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("fills missing structured payment fields with safe defaults", () => {
    const {
      paymentTermPreset,
      paymentTermPercentage,
      paymentTermLabel,
      ...legacyShape
    } = createDefaultDocument("invoice");

    expect(paymentTermPreset).toBe("");
    expect(paymentTermPercentage).toBeNull();
    expect(paymentTermLabel).toBe("");

    const result = documentSchema.safeParse(legacyShape);
    expect(result.success).toBe(true);

    if (!result.success) return;
    expect(result.data.paymentTermPreset).toBe("");
    expect(result.data.paymentTermPercentage).toBeNull();
    expect(result.data.paymentTermLabel).toBe("");
  });
});
