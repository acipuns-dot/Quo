import type { DocumentData, DocumentKind } from "../documents/types";

export type WorkspaceDocumentStatus = "draft" | "exported";

export type BusinessRecord = {
  id: string;
  userId: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  taxNumber: string;
  defaultCurrency: string;
  defaultTaxLabel: string;
  defaultTaxRate: number;
  defaultPaymentTerms: string;
  logoUrl: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type CustomerRecord = {
  id: string;
  businessId: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  taxNumber: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type SavedDocumentRecord = {
  id: string;
  businessId: string;
  customerId: string | null;
  kind: DocumentKind;
  status: WorkspaceDocumentStatus;
  documentNumber: string;
  issueDate: string;
  payloadVersion: number;
  payload: DocumentData;
  createdAt: string;
  updatedAt: string;
};
