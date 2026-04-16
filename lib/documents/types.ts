export const DOCUMENT_KINDS = ["quotation", "invoice", "receipt"] as const;
export const PAYMENT_TERM_PRESETS = [
  "full",
  "half",
  "deposit_30",
  "deposit_40",
  "deposit_50",
  "custom",
] as const;

export type DocumentKind = (typeof DOCUMENT_KINDS)[number];
export type PaymentTermPreset = (typeof PAYMENT_TERM_PRESETS)[number];

export type LineItem = {
  id: string;
  description: string;
  note: string;
  quantity: number;
  unit: string;
  customUnit: string;
  unitPrice: number;
};

export type AdditionalFee = {
  id: string;
  label: string;
  amount: number;
};

export type DocumentData = {
  kind: DocumentKind;
  templateId: string;
  themeId: string;
  businessName: string;
  businessAddress: string;
  customerName: string;
  customerAddress: string;
  documentNumber: string;
  documentDate: string;
  currency: string;
  applyTax: boolean;
  taxLabel: string;
  taxRate: number;
  validUntil: string;
  paymentTerms: string;
  paymentTermPreset: PaymentTermPreset | "";
  paymentTermPercentage: number | null;
  paymentTermLabel: string;
  notes: string;
  paymentMethod: string;
  amountReceived: number;
  logoDataUrl: string | null;
  lineItems: LineItem[];
  additionalFees: AdditionalFee[];
};

export type DocumentLayoutMode = "comfortable" | "compact";

export type PaginatedDocumentPage = {
  pageNumber: number;
  totalPages: number;
  lineItems: LineItem[];
  isFirstPage: boolean;
  isFinalPage: boolean;
  isContinuationPage: boolean;
  showTotals: boolean;
  showNotes: boolean;
};

export type PaginatedDocument = {
  layoutMode: DocumentLayoutMode;
  pages: PaginatedDocumentPage[];
};
