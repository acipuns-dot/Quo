import { calculateDocumentTotals, getPaymentTermSummary } from "./calculations";
import { paginateDocument } from "./pagination";
import type { DocumentData, PaginatedDocumentPage } from "./types";

export type ModernPdfPageModel = {
  pageNumber: number;
  totalPages: number;
  isFirstPage: boolean;
  isContinuationPage: boolean;
  showTotals: boolean;
  showNotes: boolean;
  lineItems: PaginatedDocumentPage["lineItems"];
};

export type ModernPdfModel = {
  templateId: string;
  kind: DocumentData["kind"];
  themeId: string;
  currency: string;
  header: {
    kindLabel: string;
    documentNumber: string;
    businessName: string;
    logoDataUrl: string | null;
    documentDate: string;
    validUntil: string;
  };
  parties: {
    fromLabel: string;
    toLabel: string;
    businessName: string;
    businessAddress: string;
    customerName: string;
    customerAddress: string;
  };
  totals: ReturnType<typeof calculateDocumentTotals>;
  paymentTermSummary: ReturnType<typeof getPaymentTermSummary>;
  footer: {
    businessName: string;
    kindLabel: string;
    documentNumber: string;
    validUntil: string;
  };
  notes: string;
  applyTax: boolean;
  taxLabel: string;
  pages: ModernPdfPageModel[];
};

function getPartyLabels(kind: DocumentData["kind"]) {
  if (kind === "receipt") {
    return {
      fromLabel: "Issued by",
      toLabel: "Received from",
    };
  }

  return {
    fromLabel: "Prepared by",
    toLabel: "Prepared for",
  };
}

export function buildModernPdfModel(data: DocumentData): ModernPdfModel {
  const paginated = paginateDocument(data);
  const partyLabels = getPartyLabels(data.kind);

  return {
    templateId: data.templateId,
    kind: data.kind,
    themeId: data.themeId,
    currency: data.currency,
    header: {
      kindLabel: data.kind,
      documentNumber: data.documentNumber,
      businessName: data.businessName,
      logoDataUrl: data.logoDataUrl,
      documentDate: data.documentDate,
      validUntil: data.validUntil,
    },
    parties: {
      fromLabel: partyLabels.fromLabel,
      toLabel: partyLabels.toLabel,
      businessName: data.businessName,
      businessAddress: data.businessAddress,
      customerName: data.customerName,
      customerAddress: data.customerAddress,
    },
    totals: calculateDocumentTotals(data),
    paymentTermSummary: getPaymentTermSummary(data),
    footer: {
      businessName: data.businessName,
      kindLabel: data.kind,
      documentNumber: data.documentNumber,
      validUntil: data.validUntil,
    },
    notes: data.notes,
    applyTax: data.applyTax,
    taxLabel: data.taxLabel,
    pages: paginated.pages.map((page) => ({
      pageNumber: page.pageNumber,
      totalPages: page.totalPages,
      isFirstPage: page.isFirstPage,
      isContinuationPage: page.isContinuationPage,
      showTotals: page.showTotals,
      showNotes: page.showNotes,
      lineItems: page.lineItems,
    })),
  };
}
