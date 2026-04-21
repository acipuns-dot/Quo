import React from "react";
import { paginateDocument } from "../../lib/documents/pagination";
import type { DocumentData } from "../../lib/documents/types";
import { getTemplatesForKind } from "../../lib/documents/templates";
import { useMobilePreviewScale } from "../../hooks/use-mobile-preview-scale";

export function PreviewPanel({ data }: { data: DocumentData }) {
  const templates = getTemplatesForKind(data.kind);
  const template =
    templates.find((candidate) => candidate.id === data.templateId) ??
    templates[0];
  const scale = useMobilePreviewScale();

  if (!template) {
    return null;
  }

  const renderedPages = React.Children.toArray(template.render(data));
  const isMultipage = paginateDocument(data).pages.length > 1;

  return (
    <div
      data-testid="preview-stack"
      data-renderer-id={template.id}
      data-preview-mode={isMultipage ? "multipage" : "single-page"}
      className={`flex flex-col items-center ${
        isMultipage ? "gap-8" : "gap-4"
      }`}
      style={
        scale !== null
          ? { transform: `scale(${scale})`, transformOrigin: "top center" }
          : undefined
      }
    >
      {renderedPages}
    </div>
  );
}
