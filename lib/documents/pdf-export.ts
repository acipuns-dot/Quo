import React from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { ModernPdfRenderer } from "../../components/documents/pdf/modern-pdf-renderer";
import { exportNodeToPdf } from "./export";
import { buildModernPdfModel } from "./pdf-model";
import type { DocumentData } from "./types";

export async function exportModernPdf(data: DocumentData, filename: string) {
  const model = buildModernPdfModel(data);
  const container = document.createElement("div");
  container.className = "print-stack";
  document.body.appendChild(container);

  const root = createRoot(container);

  try {
    flushSync(() => {
      root.render(React.createElement(ModernPdfRenderer, { model }));
    });

    await exportNodeToPdf(container, filename);
  } finally {
    root.unmount();
    container.remove();
  }
}

export async function exportDocumentToPdf({
  data,
  previewNode,
  filename,
}: {
  data: DocumentData;
  previewNode: HTMLElement;
  filename: string;
}) {
  if (data.templateId === "default") {
    await exportModernPdf(data, filename);
    return;
  }

  await exportNodeToPdf(previewNode, filename);
}
