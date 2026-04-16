import { documentSchema, draftDocumentSchema } from "../documents/schema";
import type { DocumentData } from "../documents/types";
import type { WorkspaceDocumentStatus } from "./types";

export const WORKSPACE_DOCUMENT_PAYLOAD_VERSION = 1;

export function serializeSavedDocumentPayload(data: DocumentData) {
  return {
    version: WORKSPACE_DOCUMENT_PAYLOAD_VERSION,
    data,
  };
}

export function deserializeSavedDocumentPayload(
  input: unknown,
  status: WorkspaceDocumentStatus = "exported",
): DocumentData {
  const parsed = input as { version?: number; data?: unknown };

  if (parsed.version !== WORKSPACE_DOCUMENT_PAYLOAD_VERSION) {
    throw new Error("Unsupported document payload version");
  }

  const payload = parsed.data as Record<string, unknown> | undefined;
  const nextData = {
    ...(payload ?? {}),
    applyTax: typeof payload?.applyTax === "boolean" ? payload.applyTax : true,
    additionalFees: Array.isArray(payload?.additionalFees) ? payload.additionalFees : [],
  };

  return status === "draft"
    ? draftDocumentSchema.parse(nextData)
    : documentSchema.parse(nextData);
}
