import type { DocumentData, DocumentKind } from "./types";
import { generateDocumentNumber } from "./document-number";

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function createDefaultDocument(kind: DocumentKind): DocumentData {
  const documentDate = formatLocalDate(new Date());

  return {
    kind,
    templateId: "default",
    themeId: "gold",
    businessName: "Studio North",
    businessAddress: "15 Market Street",
    customerName: "Acme Trading",
    customerAddress: "88 River Road",
    documentNumber: generateDocumentNumber(kind, documentDate),
    documentDate,
    currency: "USD",
    applyTax: true,
    taxLabel: "Tax",
    taxRate: 0,
    validUntil: "",
    paymentTerms: "",
    paymentTermPreset: "",
    paymentTermPercentage: null,
    paymentTermLabel: "",
    notes: "",
    paymentMethod: "",
    amountReceived: kind === "receipt" ? 250 : 0,
    logoDataUrl: null,
    lineItems: [
      {
        id: "line-1",
        description: "Design service",
        note: "",
        quantity: 1,
        unitPrice: 250,
      },
    ],
  };
}
