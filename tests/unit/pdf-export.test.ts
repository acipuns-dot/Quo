import { describe, expect, it, vi, afterEach } from "vitest";
import { createDefaultDocument } from "../../lib/documents/defaults";
import * as legacyExport from "../../lib/documents/export";
import * as pdfModel from "../../lib/documents/pdf-model";
import * as pdfExport from "../../lib/documents/pdf-export";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("exportDocumentToPdf", () => {
  it("routes modern template exports through the dedicated renderer path", async () => {
    const node = document.createElement("div");
    const data = createDefaultDocument("invoice");

    const legacySpy = vi.spyOn(legacyExport, "exportNodeToPdf").mockResolvedValue(undefined);
    const modelSpy = vi.spyOn(pdfModel, "buildModernPdfModel");

    await pdfExport.exportDocumentToPdf({
      data,
      previewNode: node,
      filename: "invoice-modern.pdf",
    });

    expect(modelSpy).toHaveBeenCalledTimes(1);
    expect(legacySpy).toHaveBeenCalledTimes(1);
    expect(legacySpy.mock.calls[0]?.[0]).not.toBe(node);
  });

  it("falls back to the legacy exporter for non-modern templates", async () => {
    const node = document.createElement("div");
    const data = createDefaultDocument("invoice");
    data.templateId = "edge";

    const legacySpy = vi.spyOn(legacyExport, "exportNodeToPdf").mockResolvedValue(undefined);
    const modelSpy = vi.spyOn(pdfModel, "buildModernPdfModel");

    await pdfExport.exportDocumentToPdf({
      data,
      previewNode: node,
      filename: "invoice-edge.pdf",
    });

    expect(legacySpy).toHaveBeenCalledTimes(1);
    expect(legacySpy.mock.calls[0]?.[0]).toBe(node);
    expect(modelSpy).not.toHaveBeenCalled();
  });
});
