import React from "react";
import { paginateDocument } from "../../lib/documents/pagination";
import type { DocumentData, DocumentLayoutMode, PaginatedDocumentPage } from "../../lib/documents/types";

export function DocumentPaginatedLayout({
  data,
  renderPage,
}: {
  data: DocumentData;
  renderPage: (
    page: PaginatedDocumentPage,
    layoutMode: DocumentLayoutMode,
  ) => React.ReactElement;
}) {
  const paginated = paginateDocument(data);

  return (
    <>
      {paginated.pages.map((page) => (
        <React.Fragment key={`${data.documentNumber}-${page.pageNumber}`}>
          {renderPage(page, paginated.layoutMode)}
        </React.Fragment>
      ))}
    </>
  );
}
