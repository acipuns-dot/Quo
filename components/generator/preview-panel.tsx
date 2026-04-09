import React from "react";
import { paginateDocument } from "../../lib/documents/pagination";
import type { DocumentData } from "../../lib/documents/types";
import { getTemplatesForKind } from "../../lib/documents/templates";

export function PreviewPanel({ data }: { data: DocumentData }) {
  const templates = getTemplatesForKind(data.kind);
  const template =
    templates.find((candidate) => candidate.id === data.templateId) ??
    templates[0];

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
    >
      {renderedPages}
    </div>
  );
}
