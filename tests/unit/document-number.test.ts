import { describe, expect, it } from "vitest";
import { generateDocumentNumber } from "../../lib/documents/document-number";

describe("generateDocumentNumber", () => {
  it("builds a kind-specific number from the document date", () => {
    expect(generateDocumentNumber("quotation", "2026-04-07")).toBe(
      "QUO-20260407",
    );
    expect(generateDocumentNumber("invoice", "2026-04-07")).toBe(
      "INV-20260407",
    );
    expect(generateDocumentNumber("receipt", "2026-04-07")).toBe(
      "RCPT-20260407",
    );
  });
});
