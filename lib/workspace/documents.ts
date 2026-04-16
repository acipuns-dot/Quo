import type { SupabaseClient } from "@supabase/supabase-js";
import { WORKSPACE_DOCUMENT_PAYLOAD_VERSION, serializeSavedDocumentPayload } from "./document-payload";
import type { DocumentData, DocumentKind } from "../documents/types";
import { generateDocumentNumber } from "../documents/document-number";
import { normalizeSavedDocumentRow } from "./normalizers";
import type { SavedDocumentRecord } from "./types";

export async function listDocumentsForBusiness(
  supabase: SupabaseClient,
  businessId: string,
): Promise<SavedDocumentRecord[]> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("business_id", businessId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) =>
    normalizeSavedDocumentRow(item as Record<string, unknown>),
  ) as SavedDocumentRecord[];
}

export async function upsertWorkspaceDocument(
  supabase: SupabaseClient,
  input: {
    businessId: string;
    customerId: string | null;
    kind: DocumentKind;
    status: "draft" | "exported";
    data: DocumentData;
  },
) {
  const storageDocumentDate = getStorageDocumentDate(input.status, input.data);
  const storageDocumentNumber = getStorageDocumentNumber(input.status, input.kind, input.data, storageDocumentDate);
  const payload = serializeSavedDocumentPayload(input.data);

  const { data, error } = await supabase
    .from("documents")
    .upsert({
      business_id: input.businessId,
      customer_id: input.customerId,
      kind: input.kind,
      status: input.status,
      document_number: storageDocumentNumber,
      issue_date: storageDocumentDate,
      payload_version: WORKSPACE_DOCUMENT_PAYLOAD_VERSION,
      payload,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "business_id,kind,document_number",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

function isValidIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [yearText, monthText, dayText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const candidate = new Date(Date.UTC(year, month - 1, day));

  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
  );
}

function formatUtcDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getStorageDocumentDate(status: "draft" | "exported", data: DocumentData) {
  if (status === "exported") {
    return data.documentDate;
  }

  return isValidIsoDate(data.documentDate) ? data.documentDate : formatUtcDate(new Date());
}

function getStorageDocumentNumber(
  status: "draft" | "exported",
  kind: DocumentKind,
  data: DocumentData,
  storageDocumentDate: string,
) {
  if (status === "exported") {
    return data.documentNumber;
  }

  return data.documentNumber.trim() || generateDocumentNumber(kind, storageDocumentDate);
}
