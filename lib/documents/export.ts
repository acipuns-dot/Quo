function buildSheetClone(sheet: HTMLElement): HTMLElement {
  const clone = sheet.cloneNode(true) as HTMLElement;
  clone.style.margin = "0";
  clone.style.borderRadius = "0";
  clone.style.boxShadow = "none";
  clone.style.height = "297mm";
  clone.style.width = "210mm";
  clone.style.overflow = "hidden";
  clone.classList.remove("mt-6", "html2pdf__page-break");
  return clone;
}

function attachExportContainer(node: HTMLElement): HTMLElement {
  const container = document.createElement("div");
  container.dataset.pdfExportContainer = "true";
  container.style.position = "fixed";
  container.style.left = "-100000px";
  container.style.top = "0";
  container.style.width = "210mm";
  container.style.background = "#ffffff";
  container.style.padding = "0";
  container.style.margin = "0";
  container.style.zIndex = "-1";
  container.appendChild(node);
  document.body.appendChild(container);
  return container;
}

export async function exportNodeToPdf(node: HTMLElement, filename: string) {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const PAGE_W_MM = 210;
  const PAGE_H_MM = 297;

  const sheets = Array.from(node.querySelectorAll<HTMLElement>(".document-sheet"));

  // Fall back to treating the whole node as a single sheet if no .document-sheet found
  const targets = sheets.length > 0 ? sheets : [node];

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  for (let i = 0; i < targets.length; i++) {
    const sheetClone = buildSheetClone(targets[i]!);
    const container = attachExportContainer(sheetClone);

    try {
      const canvas = await html2canvas(sheetClone, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        width: sheetClone.offsetWidth,
        height: sheetClone.offsetHeight,
      });

      if (i > 0) pdf.addPage();
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, PAGE_W_MM, PAGE_H_MM);
    } finally {
      container.remove();
    }
  }

  pdf.save(filename);
}
