import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import React from "react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DocumentGenerator } from "../../components/generator/document-generator";
import { createDefaultDocument } from "../../lib/documents/defaults";
import * as pdfExportModule from "../../lib/documents/pdf-export";
import * as workspaceApiModule from "../../lib/workspace/api-client";

class MockFileReader {
  static result = "data:image/png;base64,preview";

  public onload: null | (() => void) = null;
  public result: string | null = null;

  readAsDataURL() {
    this.result = MockFileReader.result;
    this.onload?.();
  }
}

beforeEach(() => {
  vi.stubGlobal("FileReader", MockFileReader);
  window.localStorage.clear();
});

async function openSection(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole("button", { name: new RegExp(name, "i") }));
}

describe("DocumentGenerator", () => {
  it("updates the preview when business name changes", async () => {
    const user = userEvent.setup();
    render(<DocumentGenerator kind="invoice" />);

    const input = screen.getByLabelText("Business name");
    await user.clear(input);
    await user.type(input, "Northwind Studio");

    expect(screen.getAllByText("Northwind Studio").length).toBeGreaterThan(0);
  });

  it("renders the download action", () => {
    render(<DocumentGenerator kind="quotation" />);
    expect(
      screen.getByRole("button", { name: "Download PDF" }),
    ).toBeInTheDocument();
  });

  it("exports the preview stack when the download action is pressed", async () => {
    const user = userEvent.setup();
    const exportSpy = vi
      .spyOn(pdfExportModule, "exportDocumentToPdf")
      .mockResolvedValue(undefined);

    render(<DocumentGenerator kind="quotation" />);

    await user.click(screen.getByRole("button", { name: "Download PDF" }));

    expect(exportSpy).toHaveBeenCalledTimes(1);
    expect(exportSpy).toHaveBeenCalledWith({
      data: expect.objectContaining({ kind: "quotation" }),
      previewNode: screen.getByTestId("preview-export-root"),
      filename: "acme-trading-QUO-20260409.pdf",
    });
  });

  it("auto-generates the document number from kind and date until manually edited", async () => {
    const user = userEvent.setup();
    render(<DocumentGenerator kind="invoice" />);

    await openSection(user, "Document details");

    const numberInput = screen.getByLabelText("Document number");
    const dateInput = screen.getByLabelText("Document date");

    expect(numberInput).toHaveValue(createDefaultDocument("invoice").documentNumber);

    await user.clear(dateInput);
    await user.type(dateInput, "2026-04-09");
    expect(numberInput).toHaveValue("INV-20260409");

    await user.clear(numberInput);
    await user.type(numberInput, "INV-CUSTOM-7");

    await user.clear(dateInput);
    await user.type(dateInput, "2026-04-10");
    expect(numberInput).toHaveValue("INV-CUSTOM-7");
  });

  it("updates the generated number when kind changes before manual edits", async () => {
    const user = userEvent.setup();
    render(<DocumentGenerator kind="quotation" />);

    await openSection(user, "Document details");
    expect(screen.getByLabelText("Document number")).toHaveValue(
      createDefaultDocument("quotation").documentNumber,
    );

    await user.click(screen.getByRole("button", { name: "Receipt" }));
    await openSection(user, "Document details");

    expect(screen.getByLabelText("Document number")).toHaveValue(
      createDefaultDocument("receipt").documentNumber,
    );
  });

  it("renders the shared fields and line item editor for invoices", async () => {
    const user = userEvent.setup();
    render(<DocumentGenerator kind="invoice" />);

    expect(screen.getByLabelText("Business address")).toBeInTheDocument();
    expect(screen.queryByLabelText("Customer address")).not.toBeInTheDocument();

    await openSection(user, "Client");
    expect(screen.getByLabelText("Customer address")).toBeInTheDocument();

    await openSection(user, "Document details");
    expect(screen.getByLabelText("Document number")).toBeInTheDocument();
    expect(screen.getByLabelText("Document date")).toBeInTheDocument();
    expect(screen.getByLabelText("Currency")).toBeInTheDocument();
    expect(screen.getByLabelText("Tax label")).toBeInTheDocument();
    expect(screen.getByLabelText("Tax rate")).toBeInTheDocument();

    await openSection(user, "Line items");
    expect(screen.getByLabelText("Line item 1 description")).toBeInTheDocument();
    expect(screen.getByLabelText("Line item 1 quantity")).toBeInTheDocument();
    expect(screen.getByLabelText("Line item 1 unit price")).toBeInTheDocument();
  });

  it("uses a non-overlapping line item layout and an A4 preview frame", async () => {
    const user = userEvent.setup();
    render(<DocumentGenerator kind="invoice" />);

    await openSection(user, "Line items");

    expect(screen.getByTestId("preview-frame")).toHaveClass("max-w-[900px]");
    expect(screen.getByTestId("line-item-card-0")).toHaveClass("space-y-2.5");
    expect(screen.getByTestId("line-item-actions-0")).not.toHaveClass(
      "lg:col-span-3",
    );
  });

  it("updates totals when tax rate and line items change", async () => {
    const user = userEvent.setup();
    render(<DocumentGenerator kind="invoice" />);

    await openSection(user, "Line items");
    await user.clear(screen.getByLabelText("Line item 1 quantity"));
    await user.type(screen.getByLabelText("Line item 1 quantity"), "2");
    await user.clear(screen.getByLabelText("Line item 1 unit price"));
    await user.type(screen.getByLabelText("Line item 1 unit price"), "50");
    await openSection(user, "Document details");
    await user.clear(screen.getByLabelText("Tax rate"));
    await user.type(screen.getByLabelText("Tax rate"), "6");

    expect(screen.getAllByText("$100.00").length).toBeGreaterThan(0);
    expect(screen.getByText("$6.00")).toBeInTheDocument();
    expect(screen.getByText("$106.00")).toBeInTheDocument();
  });

  it("supports a note on each line item and shows it in the preview", async () => {
    const user = userEvent.setup();
    render(<DocumentGenerator kind="invoice" />);

    await openSection(user, "Line items");
    await user.type(
      screen.getByLabelText("Line item 1 note"),
      "Deliver within five business days",
    );

    expect(
      screen.getByText("Deliver within five business days", { selector: "p" }),
    ).toBeInTheDocument();
  });

  it("renders receipt-specific fields and hides line item editing", async () => {
    render(<DocumentGenerator kind="receipt" />);

    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /Document details/i }));
    expect(screen.getByLabelText("Amount received")).toBeInTheDocument();
    expect(screen.getByLabelText("Payment method")).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Line item 1 description"),
    ).not.toBeInTheDocument();
  });

  it("shows validation feedback for required and invalid values", async () => {
    const user = userEvent.setup();
    render(<DocumentGenerator kind="quotation" />);

    await user.clear(screen.getByLabelText("Business name"));
    expect(screen.getByText("Business name is required.")).toBeInTheDocument();

    await openSection(user, "Document details");
    await user.clear(screen.getByLabelText("Document date"));
    await user.type(screen.getByLabelText("Document date"), "2026-02-30");

    expect(screen.getByText("Enter a valid date.")).toBeInTheDocument();
  });

  it("lets users open any section directly from the sidebar", async () => {
    const user = userEvent.setup();
    render(<DocumentGenerator kind="invoice" />);

    await user.click(screen.getByRole("button", { name: /line items/i }));

    expect(screen.getByText("Item 1")).toBeInTheDocument();
  });

  it("reopens a previous section after next marks it done", async () => {
    const user = userEvent.setup();
    render(<DocumentGenerator kind="invoice" />);

    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: /your business/i }));

    expect(screen.getByLabelText("Business name")).toBeInTheDocument();
  });

  it("keeps navigation available even when required fields are invalid", async () => {
    const user = userEvent.setup();
    render(<DocumentGenerator kind="invoice" />);

    const businessNameInput = screen.getByLabelText("Business name");
    await user.clear(businessNameInput);

    await user.click(screen.getByRole("button", { name: /notes/i }));

    expect(screen.getByLabelText("Notes")).toBeInTheDocument();
  });

  it("shows a derived amount due when a preset payment term is selected", async () => {
    const user = userEvent.setup();
    render(<DocumentGenerator kind="invoice" />);

    await user.click(screen.getByRole("button", { name: /document details/i }));
    await user.click(screen.getByRole("button", { name: "Payment term preset" }));
    const halfPaymentOption = screen.getByRole("option", { name: "Half payment (50%)" });

    expect(halfPaymentOption).toHaveClass("text-[#faf9f7]");

    await user.click(halfPaymentOption);

    expect(screen.getByText(/Amount due now:/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Payment term preset" })).toHaveTextContent(
      "Half payment (50%)",
    );
  });

  it("reveals a custom percentage field when custom payment term is selected", async () => {
    const user = userEvent.setup();
    render(<DocumentGenerator kind="invoice" />);

    await user.click(screen.getByRole("button", { name: /document details/i }));
    await user.click(screen.getByRole("button", { name: "Payment term preset" }));
    await user.click(screen.getByRole("option", { name: "Custom" }));

    expect(screen.getByLabelText("Custom payment percentage")).toBeInTheDocument();
  });

  it("does not show signature inputs in the generator", async () => {
    const user = userEvent.setup();
    render(<DocumentGenerator kind="quotation" />);

    await openSection(user, "Notes");

    expect(screen.queryByLabelText("Signer name")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Upload signature")).not.toBeInTheDocument();
  });

  it("expands colors only for the selected template and keeps the preview in sync", async () => {
    const user = userEvent.setup();
    render(<DocumentGenerator kind="quotation" />);
    const preview = within(screen.getByTestId("preview-frame"));

    const classicTemplateButton = screen.getByRole("button", { name: "Classic template" });
    const edgeTemplateButton = screen.getByRole("button", { name: "Edge template" });

    expect(screen.getByTestId("preview-frame")).toHaveAttribute(
      "data-template-id",
      "default",
    );
    expect(preview.getByText("Prepared by")).toBeInTheDocument();
    const classicColorPicker = screen.getByTestId("template-colors-default");
    expect(classicColorPicker).toBeInTheDocument();
    expect(screen.queryByTestId("template-colors-edge")).not.toBeInTheDocument();

    expect(within(classicColorPicker).getByRole("button", { name: "Gold colour" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.click(edgeTemplateButton);

    expect(screen.getByTestId("preview-frame")).toHaveAttribute(
      "data-template-id",
      "edge",
    );
    expect(edgeTemplateButton).toHaveAttribute("aria-pressed", "true");
    expect(classicTemplateButton).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByTestId("template-colors-default")).not.toBeInTheDocument();

    const edgeColorPicker = screen.getByTestId("template-colors-edge");
    expect(edgeColorPicker).toBeInTheDocument();
    expect(within(edgeColorPicker).getByRole("button", { name: "Gold colour" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(preview.getByText("Prepared by")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Business name"), " LLC");
    expect(screen.getByTestId("preview-frame")).toHaveAttribute(
      "data-template-id",
      "edge",
    );
    expect(preview.getByText("Prepared by")).toBeInTheDocument();
  });

  it("updates the active theme from the selected template's inline color picker", async () => {
    const user = userEvent.setup();
    render(<DocumentGenerator kind="invoice" />);

    const defaultPicker = screen.getByTestId("template-colors-default");
    const blueButton = within(defaultPicker).getByRole("button", { name: "Blue colour" });
    const goldButton = within(defaultPicker).getByRole("button", { name: "Gold colour" });

    expect(goldButton).toHaveAttribute("aria-pressed", "true");
    expect(blueButton).toHaveAttribute("aria-pressed", "false");

    await user.click(blueButton);

    expect(blueButton).toHaveAttribute("aria-pressed", "true");
    expect(goldButton).toHaveAttribute("aria-pressed", "false");

    await user.click(screen.getByRole("button", { name: "Edge template" }));

    const edgePicker = screen.getByTestId("template-colors-edge");
    expect(within(edgePicker).getByRole("button", { name: "Blue colour" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("keeps line item ids unique after removing and adding items", async () => {
    const user = userEvent.setup();
    render(<DocumentGenerator kind="invoice" />);

    await openSection(user, "Line items");
    const firstCard = screen.getByTestId("line-item-card-0");
    const firstId = firstCard.getAttribute("data-line-item-id");

    await user.click(screen.getByRole("button", { name: "Add line item" }));
    expect(screen.getByTestId("line-item-card-1").getAttribute("data-line-item-id")).toMatch(
      /^line-/,
    );

    await user.click(screen.getByTestId("line-item-actions-0"));
    await user.click(screen.getByRole("button", { name: "Add line item" }));

    const replacementCard = screen.getByTestId("line-item-card-1");
    expect(replacementCard).toHaveAttribute("data-line-item-id");
    expect(replacementCard.getAttribute("data-line-item-id")).not.toBe(firstId);
  });

  it("marks accordion sections with expanded state and a labelled region", async () => {
    const user = userEvent.setup();
    render(<DocumentGenerator kind="quotation" />);

    const businessButton = screen.getByRole("button", { name: /^1 Your business/i });
    expect(businessButton).toHaveAttribute("aria-expanded", "true");
    expect(businessButton).toHaveAttribute("aria-controls");

    const businessPanelId = businessButton.getAttribute("aria-controls");
    expect(businessPanelId).toBeTruthy();
    expect(screen.getByRole("region", { name: /^1 Your business/i })).toHaveAttribute(
      "id",
      businessPanelId ?? "",
    );

    await user.click(screen.getByRole("button", { name: /^2 Client/i }));
    const clientButton = screen.getByRole("button", { name: /^2 Client/i });
    expect(clientButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region", { name: /^2 Client/i })).toBeInTheDocument();
  });

  it("shows a logo preview after upload", async () => {
    const user = userEvent.setup();
    render(<DocumentGenerator kind="quotation" />);

    const fileInput = screen.getByLabelText("Upload logo");
    const file = new File(["logo"], "logo.png", { type: "image/png" });

    await user.upload(fileInput, file);

    expect(screen.getByAltText("Uploaded logo preview")).toHaveAttribute(
      "src",
      MockFileReader.result,
    );
  });

  it("shows a logo validation message for unsupported files", async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<DocumentGenerator kind="quotation" />);

    const fileInput = screen.getByLabelText("Upload logo");
    const file = new File(["logo"], "logo.gif", { type: "image/gif" });

    await user.upload(fileInput, file);

    expect(
      screen.getByText("Upload a PNG, JPG, or SVG logo under 2 MB."),
    ).toBeInTheDocument();
  });

  it("shows multiple preview pages when invoice line items overflow", async () => {
    const user = userEvent.setup();
    render(<DocumentGenerator kind="invoice" />);

    await openSection(user, "Line items");

    for (let index = 0; index < 11; index += 1) {
      await user.click(screen.getByRole("button", { name: "Add line item" }));
    }

    for (let index = 0; index < 12; index += 1) {
      await user.type(
        screen.getByLabelText(`Line item ${index + 1} description`),
        `Service ${index + 1}`,
      );
      await user.type(
        screen.getByLabelText(`Line item ${index + 1} note`),
        "Compact note",
      );
    }

    await openSection(user, "Notes");
    await user.type(screen.getByLabelText("Notes"), "Please pay within 14 days.");

    expect(screen.getAllByRole("article")).toHaveLength(2);
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
  }, 30000);

  it("keeps branded multipage preview output when many invoice line items are added", async () => {
    const user = userEvent.setup();
    render(<DocumentGenerator kind="invoice" />);

    await openSection(user, "Line items");

    for (let index = 0; index < 17; index += 1) {
      await user.click(screen.getByRole("button", { name: /add line item/i }));
    }

    for (let index = 0; index < 18; index += 1) {
      await user.type(
        screen.getByLabelText(`Line item ${index + 1} description`),
        `Service ${index + 1}`,
      );
      await user.type(
        screen.getByLabelText(`Line item ${index + 1} note`),
        "Continuation row",
      );
    }

    expect(screen.getByText(/Page 1 of \d+/)).toBeInTheDocument();
    expect(screen.getAllByText(/invoice/i).length).toBeGreaterThan(2);
    expect(screen.getAllByText("Total")).toHaveLength(1);
    expect(screen.getByTestId("preview-stack")).toHaveAttribute(
      "data-preview-mode",
      "multipage",
    );
    expect(
      screen.getByTestId("preview-export-root").querySelectorAll(".document-sheet"),
    ).toHaveLength(2);
  }, 30000);

  it("keeps a medium quotation on one page in compact mode", async () => {
    const user = userEvent.setup();
    render(<DocumentGenerator kind="quotation" />);

    await openSection(user, "Line items");

    for (let index = 0; index < 5; index += 1) {
      await user.click(screen.getByRole("button", { name: "Add line item" }));
    }

    for (let index = 0; index < 6; index += 1) {
      await user.type(
        screen.getByLabelText(`Line item ${index + 1} description`),
        `Milestone ${index + 1}`,
      );
      await user.type(
        screen.getByLabelText(`Line item ${index + 1} note`),
        "Scope note",
      );
    }

    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.queryByText("Page 2 of 2")).not.toBeInTheDocument();
  }, 10000);

  it("restores the saved draft for the current document kind on first render", async () => {
    window.localStorage.setItem(
      "quo:draft:invoice",
      JSON.stringify({
        version: 1,
        kind: "invoice",
        documentNumberAuto: false,
        data: {
          ...createDefaultDocument("invoice"),
          businessName: "Saved Invoice Studio",
          documentNumber: "INV-SAVED-001",
        },
      }),
    );

    const user = userEvent.setup();
    render(<DocumentGenerator kind="invoice" />);

    expect(screen.getByLabelText("Business name")).toHaveValue(
      "Saved Invoice Studio",
    );
    expect(screen.getByTestId("preview-frame")).toHaveAttribute("data-template-id", "default");

    await openSection(user, "Document details");
    expect(screen.getByLabelText("Document number")).toHaveValue("INV-SAVED-001");
  });

  it("restores each document kind from its own saved draft when switching kinds", async () => {
    const user = userEvent.setup();

    window.localStorage.setItem(
      "quo:draft:quotation",
      JSON.stringify({
        version: 1,
        kind: "quotation",
        documentNumberAuto: true,
        data: {
          ...createDefaultDocument("quotation"),
          businessName: "Quotation Draft Co",
        },
      }),
    );

    window.localStorage.setItem(
      "quo:draft:receipt",
      JSON.stringify({
        version: 1,
        kind: "receipt",
        documentNumberAuto: true,
        data: {
          ...createDefaultDocument("receipt"),
          businessName: "Receipt Draft Co",
        },
      }),
    );

    render(<DocumentGenerator kind="quotation" />);
    expect(screen.getByLabelText("Business name")).toHaveValue("Quotation Draft Co");

    await user.click(screen.getByRole("button", { name: "Receipt" }));
    expect(screen.getByLabelText("Business name")).toHaveValue("Receipt Draft Co");
  });

  it("autosaves the active kind and clears only that kind draft", async () => {
    const user = userEvent.setup();
    render(<DocumentGenerator kind="invoice" />);

    const input = screen.getByLabelText("Business name");
    await user.clear(input);
    await user.type(input, "Drafted Invoice Studio");

    await vi.waitFor(() => {
      const stored = window.localStorage.getItem("quo:draft:invoice");
      expect(stored).toContain("Drafted Invoice Studio");
    });

    window.localStorage.setItem(
      "quo:draft:quotation",
      JSON.stringify({
        version: 1,
        kind: "quotation",
        documentNumberAuto: true,
        data: {
          ...createDefaultDocument("quotation"),
        },
      }),
    );

    await user.click(screen.getByRole("button", { name: /clear draft/i }));

    expect(window.localStorage.getItem("quo:draft:invoice")).toBeNull();
    expect(window.localStorage.getItem("quo:draft:quotation")).not.toBeNull();
  });

  it("falls back to defaults when the stored draft is invalid", () => {
    window.localStorage.setItem("quo:draft:invoice", "{broken-json");

    render(<DocumentGenerator kind="invoice" />);

    expect(screen.getByLabelText("Business name")).toHaveValue("Studio North");
  });

  it("prefills business details from workspace context", () => {
    render(
      <DocumentGenerator
        kind="invoice"
        workspace={{
          businessId: "biz_1",
          businessName: "Workspace Studio",
          customerOptions: [],
        }}
      />,
    );

    expect(screen.getByLabelText("Business name")).toHaveValue("Workspace Studio");
  });

  it("shows workspace customer suggestions and applies the selected customer", async () => {
    const user = userEvent.setup();

    render(
      <DocumentGenerator
        kind="invoice"
        workspace={{
          businessId: "biz_1",
          businessName: "Workspace Studio",
          customerOptions: [
            { id: "cust_1", name: "Acme Holdings", address: "100 Market Street" },
            { id: "cust_2", name: "Blue River Co", address: "55 Lake Road" },
          ],
        }}
      />,
    );

    await openSection(user, "Client");
    await user.clear(screen.getByLabelText("Customer name"));
    await user.type(screen.getByLabelText("Customer name"), "ac");

    await user.click(screen.getByRole("button", { name: /Acme Holdings/i }));

    expect(screen.getByLabelText("Customer name")).toHaveValue("Acme Holdings");
    expect(screen.getByLabelText("Customer address")).toHaveValue("100 Market Street");
  });

  it("posts premium draft autosaves through the workspace api client", async () => {
    const user = userEvent.setup();
    const draftSpy = vi
      .spyOn(workspaceApiModule, "saveWorkspaceDraft")
      .mockResolvedValue({ ok: true });

    render(
      <DocumentGenerator
        kind="invoice"
        workspace={{
          businessId: "biz_1",
          businessName: "Workspace Studio",
          apiBasePath: "/api/workspace/businesses/biz_1/documents",
          customerOptions: [],
        }}
      />,
    );

    await user.clear(screen.getByLabelText("Business name"));
    await user.type(screen.getByLabelText("Business name"), "Workspace Updated");

    await vi.waitFor(() => {
      expect(draftSpy).toHaveBeenCalledWith(
        "/api/workspace/businesses/biz_1/documents",
        expect.objectContaining({
          kind: "invoice",
          customerId: null,
        }),
      );
    });
  });

  it("posts exported premium documents through the workspace api client", async () => {
    const user = userEvent.setup();
    vi.spyOn(pdfExportModule, "exportDocumentToPdf").mockResolvedValue(undefined);
    const exportSpy = vi
      .spyOn(workspaceApiModule, "saveWorkspaceExport")
      .mockResolvedValue({ ok: true });

    render(
      <DocumentGenerator
        kind="invoice"
        workspace={{
          businessId: "biz_1",
          businessName: "Workspace Studio",
          apiBasePath: "/api/workspace/businesses/biz_1/documents",
          customerOptions: [],
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Download PDF" }));

    expect(exportSpy).toHaveBeenCalledWith(
      "/api/workspace/businesses/biz_1/documents",
      expect.objectContaining({
        kind: "invoice",
        customerId: null,
      }),
    );
  });
});
