import type { WorkspaceAccountProfile } from "./account-profiles";
import type {
  BusinessRecord,
  CustomerRecord,
  SavedDocumentRecord,
} from "./types";

const FALLBACK_TIMESTAMP = new Date(0).toISOString();

function stringOrEmpty(value: unknown) {
  return typeof value === "string" ? value : "";
}

function stringOrFallback(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function numberOrFallback(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function booleanOrFallback(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function timestampOrFallback(value: unknown) {
  return typeof value === "string" && value ? value : FALLBACK_TIMESTAMP;
}

export function normalizeBusinessRow(row: Record<string, unknown>): BusinessRecord {
  return {
    id: stringOrFallback(row.id, "unknown-business"),
    userId: stringOrFallback(row.user_id, "unknown-user"),
    name: stringOrFallback(row.name, "Untitled business"),
    address: stringOrEmpty(row.address),
    email: stringOrEmpty(row.email),
    phone: stringOrEmpty(row.phone),
    taxNumber: stringOrEmpty(row.tax_number),
    defaultCurrency: stringOrFallback(row.default_currency, "USD"),
    defaultTaxLabel: stringOrFallback(row.default_tax_label, "Tax"),
    defaultTaxRate: numberOrFallback(row.default_tax_rate, 0),
    applyTaxByDefault: booleanOrFallback(row.apply_tax_by_default, true),
    defaultPaymentTerms: stringOrEmpty(row.default_payment_terms),
    logoUrl: typeof row.logo_url === "string" ? row.logo_url : null,
    notes: stringOrEmpty(row.notes),
    createdAt: timestampOrFallback(row.created_at),
    updatedAt: timestampOrFallback(row.updated_at),
  };
}

export function normalizeCustomerRow(row: Record<string, unknown>): CustomerRecord {
  return {
    id: stringOrFallback(row.id, "unknown-customer"),
    businessId: stringOrFallback(row.business_id, "unknown-business"),
    name: stringOrFallback(row.name, "Untitled customer"),
    address: stringOrEmpty(row.address),
    email: stringOrEmpty(row.email),
    phone: stringOrEmpty(row.phone),
    taxNumber: stringOrEmpty(row.tax_number),
    notes: stringOrEmpty(row.notes),
    createdAt: timestampOrFallback(row.created_at),
    updatedAt: timestampOrFallback(row.updated_at),
  };
}

export function normalizeSavedDocumentRow(
  row: Record<string, unknown>,
): Omit<SavedDocumentRecord, "payload"> & { payload: SavedDocumentRecord["payload"] | null } {
  return {
    id: stringOrFallback(row.id, "unknown-document"),
    businessId: stringOrFallback(row.business_id, "unknown-business"),
    customerId: typeof row.customer_id === "string" ? row.customer_id : null,
    kind: row.kind === "quotation" || row.kind === "receipt" ? row.kind : "invoice",
    status: row.status === "exported" ? "exported" : "draft",
    documentNumber: stringOrEmpty(row.document_number),
    issueDate: stringOrEmpty(row.issue_date),
    payloadVersion: numberOrFallback(row.payload_version, 1),
    payload:
      row.payload && typeof row.payload === "object"
        ? (row.payload as SavedDocumentRecord["payload"])
        : null,
    createdAt: timestampOrFallback(row.created_at),
    updatedAt: timestampOrFallback(row.updated_at),
  };
}

export function normalizeWorkspaceAccountProfileRow(
  row: Record<string, unknown>,
): WorkspaceAccountProfile {
  return {
    userId: stringOrFallback(row.user_id, "unknown-user"),
    plan: row.plan === "premium" ? "premium" : "free",
    createdAt: timestampOrFallback(row.created_at),
    updatedAt: timestampOrFallback(row.updated_at),
  };
}
