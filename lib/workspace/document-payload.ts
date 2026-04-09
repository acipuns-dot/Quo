import { documentSchema } from "../documents/schema";
import type { DocumentData } from "../documents/types";

export const WORKSPACE_DOCUMENT_PAYLOAD_VERSION = 1;

export function serializeSavedDocumentPayload(data: DocumentData) {
  return {
    version: WORKSPACE_DOCUMENT_PAYLOAD_VERSION,
    data,
  };
}

export function deserializeSavedDocumentPayload(input: unknown): DocumentData {
  const parsed = input as { version?: number; data?: unknown };

  if (parsed.version !== WORKSPACE_DOCUMENT_PAYLOAD_VERSION) {
    throw new Error("Unsupported document payload version");
  }

  return documentSchema.parse(parsed.data);
}
