import type { SupabaseClient } from "@supabase/supabase-js";
import { WORKSPACE_DOCUMENT_PAYLOAD_VERSION, serializeSavedDocumentPayload } from "./document-payload";
import type { DocumentData, DocumentKind } from "../documents/types";
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

  return (data ?? []).map((item) => ({
    id: item.id,
    businessId: item.business_id,
    customerId: item.customer_id,
    kind: item.kind,
    status: item.status,
    documentNumber: item.document_number,
    issueDate: item.issue_date,
    payloadVersion: item.payload_version,
    payload: item.payload,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
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
  const payload = serializeSavedDocumentPayload(input.data);

  const { data, error } = await supabase
    .from("documents")
    .upsert({
      business_id: input.businessId,
      customer_id: input.customerId,
      kind: input.kind,
      status: input.status,
      document_number: input.data.documentNumber,
      issue_date: input.data.documentDate,
      payload_version: WORKSPACE_DOCUMENT_PAYLOAD_VERSION,
      payload,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
