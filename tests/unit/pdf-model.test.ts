import { describe, expect, it } from "vitest";
import { createDefaultDocument } from "../../lib/documents/defaults";
import { buildModernPdfModel } from "../../lib/documents/pdf-model";

describe("buildModernPdfModel", () => {
  it("builds a one-page modern invoice model with totals and footer metadata", () => {
    const data = createDefaultDocument("invoice");
    const model = buildModernPdfModel(data);

    expect(model.templateId).toBe("default");
    expect(model.pages).toHaveLength(1);
    expect(model.pages[0]?.showTotals).toBe(true);
    expect(model.pages[0]?.showNotes).toBe(true);
    expect(model.footer.documentNumber).toBe(data.documentNumber);
    expect(model.header.kindLabel).toBe("invoice");
  });

  it("builds repeated page metadata for a multipage modern invoice", () => {
    const data = createDefaultDocument("invoice");
    data.lineItems = Array.from({ length: 18 }, (_, index) => ({
      id: `line-${index + 1}`,
      description: `Service ${index + 1}`,
      note: "Continuation row",
      quantity: 1,
      unitPrice: 100,
    }));

    const model = buildModernPdfModel(data);

    expect(model.pages.length).toBeGreaterThan(1);
    expect(model.pages[0]?.pageNumber).toBe(1);
    expect(model.pages[0]?.totalPages).toBe(model.pages.length);
    expect(model.pages.at(-1)?.showTotals).toBe(true);
    expect(model.pages.at(-1)?.showNotes).toBe(true);
  });
});
