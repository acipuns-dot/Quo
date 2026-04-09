import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { exportNodeToPdf } from "../../lib/documents/export";

// ─── mock html2canvas ─────────────────────────────────────────────────────────

const mockCanvas = {
  toDataURL: vi.fn(() => "data:image/jpeg;base64,fake"),
};
const html2canvasMock = vi.fn(async () => mockCanvas);

vi.mock("html2canvas", () => ({ default: html2canvasMock }));

// ─── mock jspdf ───────────────────────────────────────────────────────────────

const jsPdfInstance = {
  addPage: vi.fn(),
  addImage: vi.fn(),
  save: vi.fn(),
};
const jsPdfConstructor = vi.fn(() => jsPdfInstance);

vi.mock("jspdf", () => ({ default: jsPdfConstructor }));

// ─── helpers ──────────────────────────────────────────────────────────────────

describe("exportNodeToPdf", () => {
  beforeEach(() => {
    html2canvasMock.mockClear();
    mockCanvas.toDataURL.mockClear();
    jsPdfConstructor.mockClear();
    jsPdfInstance.addPage.mockClear();
    jsPdfInstance.addImage.mockClear();
    jsPdfInstance.save.mockClear();
    document.body.innerHTML = "";
  });

  it("renders each .document-sheet as its own canvas page", async () => {
    const node = document.createElement("div");
    node.innerHTML = `
      <article class="document-sheet">Page 1</article>
      <article class="document-sheet">Page 2</article>
    `;
    document.body.appendChild(node);

    await exportNodeToPdf(node, "invoice.pdf");

    expect(html2canvasMock).toHaveBeenCalledTimes(2);
    expect(jsPdfInstance.addPage).toHaveBeenCalledTimes(1);
    expect(jsPdfInstance.addImage).toHaveBeenCalledTimes(2);
    expect(jsPdfInstance.save).toHaveBeenCalledWith("invoice.pdf");
  });

  it("does not call addPage for a single-sheet document", async () => {
    const node = document.createElement("div");
    node.innerHTML = `<article class="document-sheet">Page 1</article>`;
    document.body.appendChild(node);

    await exportNodeToPdf(node, "single.pdf");

    expect(html2canvasMock).toHaveBeenCalledTimes(1);
    expect(jsPdfInstance.addPage).not.toHaveBeenCalled();
    expect(jsPdfInstance.addImage).toHaveBeenCalledTimes(1);
  });

  it("adds each image at the full A4 page size", async () => {
    const node = document.createElement("div");
    node.innerHTML = `
      <article class="document-sheet">Page 1</article>
      <article class="document-sheet">Page 2</article>
    `;
    document.body.appendChild(node);

    await exportNodeToPdf(node, "invoice-sizing.pdf");

    for (const call of jsPdfInstance.addImage.mock.calls) {
      expect(call).toEqual(["data:image/jpeg;base64,fake", "JPEG", 0, 0, 210, 297]);
    }
  });

  it("creates jsPDF with A4 mm portrait settings", async () => {
    const node = document.createElement("div");
    node.innerHTML = `<article class="document-sheet">Page 1</article>`;
    document.body.appendChild(node);

    await exportNodeToPdf(node, "invoice-jspdf-config.pdf");

    expect(jsPdfConstructor).toHaveBeenCalledWith({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });
  });

  it("removes the temporary export container after each sheet is rendered", async () => {
    const node = document.createElement("div");
    node.innerHTML = `
      <article class="document-sheet">Page 1</article>
      <article class="document-sheet">Page 2</article>
    `;
    document.body.appendChild(node);

    await exportNodeToPdf(node, "invoice-cleanup.pdf");

    expect(document.querySelectorAll("[data-pdf-export-container='true']")).toHaveLength(0);
  });

  it("strips mt-6 and html2pdf__page-break classes from each sheet clone", async () => {
    const node = document.createElement("div");
    node.innerHTML = `
      <article class="document-sheet mt-6">Page 1</article>
      <article class="document-sheet mt-6 html2pdf__page-break">Page 2</article>
    `;
    document.body.appendChild(node);

    await exportNodeToPdf(node, "invoice-classes.pdf");

    const clonedSheets = html2canvasMock.mock.calls.map(
      (call) => (call as unknown as [HTMLElement])[0],
    );

    for (const sheet of clonedSheets) {
      expect(sheet.classList.contains("mt-6")).toBe(false);
      expect(sheet.classList.contains("html2pdf__page-break")).toBe(false);
    }
  });

  it("sets A4 dimensions and clips overflow on each sheet clone", async () => {
    const node = document.createElement("div");
    node.innerHTML = `<article class="document-sheet shadow-md rounded-[24px]">Page 1</article>`;
    document.body.appendChild(node);

    await exportNodeToPdf(node, "invoice-sheet-style.pdf");

    const sheet = (html2canvasMock.mock.calls[0] as unknown as [HTMLElement])[0];
    expect(sheet.style.height).toBe("297mm");
    expect(sheet.style.width).toBe("210mm");
    expect(sheet.style.overflow).toBe("hidden");
    expect(sheet.style.margin).toBe("0px");
    expect(sheet.style.borderRadius).toBe("0");
    expect(sheet.style.boxShadow).toBe("none");
  });

  it("falls back to the node itself when no .document-sheet children are found", async () => {
    const node = document.createElement("div");
    node.textContent = "Plain content";
    document.body.appendChild(node);

    await exportNodeToPdf(node, "invoice-fallback.pdf");

    expect(html2canvasMock).toHaveBeenCalledTimes(1);
    expect(jsPdfInstance.addImage).toHaveBeenCalledTimes(1);
  });
});
