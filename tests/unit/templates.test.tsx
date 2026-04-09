import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DocumentShell } from "../../components/documents/document-shell";
import { PreviewPanel } from "../../components/generator/preview-panel";
import { createDefaultDocument } from "../../lib/documents/defaults";
import * as templatesModule from "../../lib/documents/templates";
import {
  getTemplateById,
  getTemplatesForKind,
  THEMES,
} from "../../lib/documents/templates";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getTemplatesForKind", () => {
  it("returns exactly four templates for each document kind", () => {
    expect(getTemplatesForKind("quotation")).toHaveLength(4);
    expect(getTemplatesForKind("invoice")).toHaveLength(4);
    expect(getTemplatesForKind("receipt")).toHaveLength(4);
  });

  it("returns frozen template copies instead of live registry objects", () => {
    const first = getTemplateById("default");
    const second = getTemplateById("default");

    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect(first).not.toBe(second);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(second)).toBe(true);
    expect(() => {
      Object.assign(first ?? {}, { label: "Mutated" });
    }).toThrow();
  });

  it("returns undefined for an unknown template id", () => {
    expect(getTemplateById("unknown")).toBeUndefined();
  });
});

describe("THEMES", () => {
  it("exports seven colour themes", () => {
    expect(THEMES).toHaveLength(7);
  });

  it("each theme has id, label, and accent", () => {
    for (const theme of THEMES) {
      expect(theme.id).toBeTruthy();
      expect(theme.label).toBeTruthy();
      expect(theme.accent).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("theme ids are unique", () => {
    const ids = THEMES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

it("renders business and customer names in the default template", () => {
  const template = getTemplateById("default");

  expect(template).toBeDefined();
  render(template!.render(createDefaultDocument("invoice")));

  expect(screen.getAllByText("Studio North").length).toBeGreaterThan(0);
  expect(screen.getAllByText("Acme Trading").length).toBeGreaterThan(0);
});

it("renders the full footer business name in the classic template", () => {
  const template = getTemplateById("classic");
  const data = createDefaultDocument("invoice");

  data.businessName = "Studio North Creative Holdings";

  render(template!.render(data));

  expect(screen.getAllByText("Studio North Creative Holdings")).toHaveLength(3);
});

it("renders the full footer business name in the edge template", () => {
  const template = getTemplateById("edge");
  const data = createDefaultDocument("invoice");

  data.businessName = "Studio North Creative Holdings";

  render(template!.render(data));

  expect(screen.getAllByText("Studio North Creative Holdings")).toHaveLength(3);
});

it("renders the full footer business name in the unified template", () => {
  const template = getTemplateById("default");
  const data = createDefaultDocument("invoice");

  data.businessName = "Studio North Creative Holdings";

  render(template!.render(data));

  expect(screen.getByText("STUDIO NORTH CREATIVE HOLDINGS")).toBeInTheDocument();
});

it("renders a centered top-right document block in the edge template", () => {
  const template = getTemplateById("edge");
  const data = createDefaultDocument("invoice");

  data.documentNumber = "INV-20260409";

  const { container } = render(template!.render(data));
  const headerBlock = container.querySelector("[data-edge-doc-header='true']") as HTMLElement | null;

  expect(headerBlock).not.toBeNull();
  expect(headerBlock?.style.alignItems).toBe("center");
  expect(headerBlock?.style.textAlign).toBe("center");
});

it.each([["classic"], ["edge"], ["default"]])(
  "renders an in-flow footer container for the %s template",
  (templateId) => {
    const template = getTemplateById(templateId);
    const data = createDefaultDocument("invoice");

    const { container } = render(template!.render(data));
    const footer = container.querySelector(`[data-template-footer="${templateId}"]`) as HTMLElement | null;

    expect(footer).not.toBeNull();
    expect(footer?.style.marginTop).toBe("auto");
    expect(footer?.style.marginBottom).toBe("");
  },
);

it("renders Prepared by / Prepared for labels in the default template", () => {
  const template = getTemplateById("default");

  expect(template).toBeDefined();
  render(template!.render(createDefaultDocument("invoice")));

  expect(screen.getByText("Prepared by")).toBeInTheDocument();
  expect(screen.getByText("Prepared for")).toBeInTheDocument();
});

it("renders a compact receipt structure in the default template", () => {
  const template = getTemplateById("default");

  expect(template).toBeDefined();
  render(template!.render(createDefaultDocument("receipt")));

  expect(screen.getByText("Received from")).toBeInTheDocument();
  expect(screen.getByText("Issued by")).toBeInTheDocument();
  expect(screen.getByText("Amount received")).toBeInTheDocument();
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
});

it("renders the matching template from the current kind in the preview panel", () => {
  const document = createDefaultDocument("invoice");
  const data = { ...document, templateId: "default" };
  const fallbackTemplate = {
    id: "fallback",
    label: "Fallback",
    render: vi.fn(() => <div>fallback preview</div>),
  };
  const selectedTemplate = {
    id: "default",
    label: "Classic",
    render: vi.fn(() => <div>default preview</div>),
  };

  vi.spyOn(templatesModule, "getTemplatesForKind").mockReturnValue([
    fallbackTemplate,
    selectedTemplate,
  ] as never);

  render(<PreviewPanel data={data} />);

  expect(screen.getByText("default preview")).toBeInTheDocument();
  expect(screen.queryByText("fallback preview")).not.toBeInTheDocument();
  expect(fallbackTemplate.render).not.toHaveBeenCalled();
  expect(selectedTemplate.render).toHaveBeenCalledWith(data);
});

it("falls back to the first template when the template id is invalid", () => {
  const document = createDefaultDocument("receipt");
  const data = { ...document, templateId: "unknown" };
  const fallbackTemplate = {
    id: "default",
    label: "Classic",
    render: vi.fn(() => <div>default receipt preview</div>),
  };
  const otherTemplate = {
    id: "other",
    label: "Other",
    render: vi.fn(() => <div>other receipt preview</div>),
  };

  vi.spyOn(templatesModule, "getTemplatesForKind").mockReturnValue([
    fallbackTemplate,
    otherTemplate,
  ] as never);

  render(<PreviewPanel data={data} />);

  expect(screen.getByText("default receipt preview")).toBeInTheDocument();
  expect(screen.queryByText("other receipt preview")).not.toBeInTheDocument();
  expect(fallbackTemplate.render).toHaveBeenCalledWith(data);
  expect(otherTemplate.render).not.toHaveBeenCalled();
});

it("uses a fixed A4 page shell in preview rendering", () => {
  const { container } = render(
    <DocumentShell accentClass="">
      <div>Preview page</div>
    </DocumentShell>,
  );

  expect(container.firstElementChild).toHaveClass("h-[297mm]");
  expect(container.firstElementChild).not.toHaveClass("min-h-[297mm]");
});

it("keeps single-page previews in a calm single-page mode", () => {
  const data = createDefaultDocument("invoice");

  render(<PreviewPanel data={data} />);

  const previewStack = screen.getByTestId("preview-stack");
  expect(previewStack).toHaveAttribute("data-preview-mode", "single-page");
  expect(previewStack).toHaveClass("gap-4");
  expect(previewStack).not.toHaveClass("gap-8");
});

it.each([["classic"], ["edge"], ["default"]])(
  "does not show page meta on a single-page %s document",
  (templateId) => {
    const template = getTemplateById(templateId);
    const data = createDefaultDocument("invoice");

    data.templateId = templateId;

    render(template!.render(data));

    expect(screen.queryByText(/Page 1 of 1/)).not.toBeInTheDocument();
  },
);

it("renders continuation metadata and repeated tables for a paginated invoice", () => {
  const template = getTemplateById("default");
  const data = createDefaultDocument("invoice");

  data.notes = "Please reference the invoice number on transfer.";
  data.lineItems = Array.from({ length: 18 }, (_, index) => ({
    id: `line-${index + 1}`,
    description: `Service ${index + 1}`,
    note: "Continuation row",
    quantity: 1,
    unitPrice: 100,
  }));

  render(template!.render(data));

  expect(screen.getByText(/Page 1 of \d+/)).toBeInTheDocument();
  expect(screen.getAllByRole("table").length).toBeGreaterThan(1);
  expect(screen.getAllByText("Deliverable").length).toBeGreaterThan(1);
});

it("does not render blank draft line items into the document table", () => {
  const template = getTemplateById("default");
  const data = createDefaultDocument("invoice");

  data.lineItems = [
    data.lineItems[0]!,
    ...Array.from({ length: 5 }, (_, index) => ({
      id: `draft-${index + 1}`,
      description: "",
      note: "",
      quantity: 1,
      unitPrice: 0,
    })),
  ];

  render(template!.render(data));

  const table = screen.getByRole("table");
  expect(within(table).getAllByRole("row")).toHaveLength(2);
  expect(screen.getAllByText("$0.00")).toHaveLength(1);
});

it("renders multipage previews as an explicit vertical page stack", () => {
  const data = createDefaultDocument("invoice");

  data.notes = "Please reference the invoice number on transfer.";
  data.lineItems = Array.from({ length: 18 }, (_, index) => ({
    id: `line-${index + 1}`,
    description: `Service ${index + 1}`,
    note: "Continuation row",
    quantity: 1,
    unitPrice: 100,
  }));

  render(<PreviewPanel data={data} />);

  const previewStack = screen.getByTestId("preview-stack");
  const renderedPages = previewStack.querySelectorAll(".document-sheet");

  expect(previewStack).toHaveAttribute("data-preview-mode", "multipage");
  expect(previewStack).toHaveClass("gap-8");
  expect(renderedPages.length).toBeGreaterThan(1);
  expect(renderedPages[0]).toHaveTextContent(/Page 1 of \d+/);
  expect(renderedPages[renderedPages.length - 1]).toHaveTextContent(
    new RegExp(`Page ${renderedPages.length} of ${renderedPages.length}`),
  );
});

it.each([["classic"], ["edge"], ["default"]])(
  "renders header and footer on every page for the %s template",
  (templateId) => {
    const template = getTemplateById(templateId);
    const data = createDefaultDocument("invoice");

    data.templateId = templateId;
    data.documentNumber = "INV-20260409";
    data.businessName = "Northwind Studio Holdings";
    data.lineItems = Array.from({ length: 18 }, (_, index) => ({
      id: `line-${index + 1}`,
      description: `Service ${index + 1}`,
      note: "Continuation row",
      quantity: 1,
      unitPrice: 100,
    }));

    render(template!.render(data));

    expect(screen.getByText(/Page 1 of \d+/)).toBeInTheDocument();
    expect(document.querySelectorAll(".document-sheet").length).toBeGreaterThan(1);
    expect(screen.getAllByText(/INV-20260409/i).length).toBeGreaterThan(1);
    expect(screen.getAllByText(/invoice/i).length).toBeGreaterThan(2);
  },
);

it("keeps totals on the final page only", () => {
  const template = getTemplateById("default");
  const data = createDefaultDocument("quotation");

  data.lineItems = Array.from({ length: 18 }, (_, index) => ({
    id: `line-${index + 1}`,
    description: `Milestone ${index + 1}`,
    note: "Compact overflow note",
    quantity: 1,
    unitPrice: 100,
  }));

  render(template!.render(data));

  expect(screen.getAllByText("Total")).toHaveLength(1);
  expect(document.querySelectorAll(".document-sheet").length).toBeGreaterThan(1);
});

it.each([["classic"], ["edge"], ["default"]])(
  "renders totals only once on the final page for the %s template",
  (templateId) => {
    const template = getTemplateById(templateId);
    const data = createDefaultDocument("quotation");

    data.templateId = templateId;
    data.lineItems = Array.from({ length: 18 }, (_, index) => ({
      id: `line-${index + 1}`,
      description: `Milestone ${index + 1}`,
      note: "Compact overflow note",
      quantity: 1,
      unitPrice: 100,
    }));

    render(template!.render(data));

    expect(screen.getAllByText("Total")).toHaveLength(1);
    expect(document.querySelectorAll(".document-sheet").length).toBeGreaterThan(1);
  },
);

it("does not render authorized signature labels in the default template", () => {
  const template = getTemplateById("default");
  const data = createDefaultDocument("invoice");

  render(template!.render(data));

  expect(screen.queryByText("Authorized signature")).not.toBeInTheDocument();
});

it("renders the no-signature-required notice even when notes are empty", () => {
  const template = getTemplateById("default");
  const data = createDefaultDocument("invoice");

  data.notes = "";

  render(template!.render(data));

  expect(
    screen.getByText("This is an auto-generated document. No signature required."),
  ).toBeInTheDocument();
});

it("renders the no-signature-required notice after notes content", () => {
  const template = getTemplateById("default");
  const data = createDefaultDocument("invoice");

  data.notes = "Payment due in 14 days.";

  render(template!.render(data));

  expect(
    screen.getByText("This is an auto-generated document. No signature required."),
  ).toBeInTheDocument();
  expect(screen.getByText("Notes")).toBeInTheDocument();
  expect(screen.getByText("Payment due in 14 days.")).toBeInTheDocument();
});

it("renders the highlighted total row with the gold accent colour", () => {
  const template = getTemplateById("default");
  const data = { ...createDefaultDocument("invoice"), themeId: "gold" };

  render(template!.render(data));

  const totalLabel = screen.getAllByText("Total")[0];
  const totalRow = totalLabel.parentElement;

  expect(totalRow).toHaveStyle({
    backgroundColor: "rgb(212, 144, 30)",
    color: "rgb(255, 255, 255)",
  });
  expect(totalRow).toHaveStyle({
    printColorAdjust: "exact",
  });
});

it("shows payment terms and amount due in invoice totals", () => {
  const data = {
    ...createDefaultDocument("invoice"),
    paymentTermPreset: "half" as const,
    paymentTermPercentage: 50,
  };

  render(<PreviewPanel data={data} />);

  expect(screen.getByText("Payment terms")).toBeInTheDocument();
  expect(screen.getByText("Half payment (50%)")).toBeInTheDocument();
  expect(screen.getByText("Amount due now")).toBeInTheDocument();
});

it("does not show payment terms when no structured option is selected", () => {
  render(<PreviewPanel data={createDefaultDocument("invoice")} />);

  expect(screen.queryByText("Amount due now")).not.toBeInTheDocument();
});

it("does not show invoice-style payment terms on receipts", () => {
  const data = {
    ...createDefaultDocument("receipt"),
    paymentTermPreset: "full" as const,
    paymentTermPercentage: 100,
  };

  render(<PreviewPanel data={data} />);

  expect(screen.queryByText("Amount due now")).not.toBeInTheDocument();
});
