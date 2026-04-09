import type { DocumentKind } from "./types";

const PREFIX_BY_KIND: Record<DocumentKind, string> = {
  quotation: "QUO",
  invoice: "INV",
  receipt: "RCPT",
};

export function generateDocumentNumber(
  kind: DocumentKind,
  documentDate: string,
): string {
  const compactDate = documentDate.replaceAll("-", "");
  return `${PREFIX_BY_KIND[kind]}-${compactDate}`;
}
