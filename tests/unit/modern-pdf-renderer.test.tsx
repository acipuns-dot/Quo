import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { createDefaultDocument } from "../../lib/documents/defaults";
import { buildModernPdfModel } from "../../lib/documents/pdf-model";
import { ModernPdfRenderer } from "../../components/documents/pdf/modern-pdf-renderer";

describe("ModernPdfRenderer", () => {
  it("renders one article per page with modern document metadata", () => {
    const data = createDefaultDocument("invoice");
    const model = buildModernPdfModel(data);

    const { container } = render(<ModernPdfRenderer model={model} />);

    expect(container.querySelectorAll(".document-sheet")).toHaveLength(1);
    expect(screen.getAllByText(data.documentNumber).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/invoice/i).length).toBeGreaterThan(0);
  });

  it("renders footer and payment-term content from the shared model", () => {
    const data = createDefaultDocument("invoice");
    data.paymentTermPreset = "half";
    data.paymentTermPercentage = 50;

    const model = buildModernPdfModel(data);

    render(<ModernPdfRenderer model={model} />);

    expect(screen.getByText(data.businessName.toUpperCase())).toBeInTheDocument();
    expect(screen.getByText(/payment terms/i)).toBeInTheDocument();
    expect(screen.getByText(/amount due now/i)).toBeInTheDocument();
  });
});
