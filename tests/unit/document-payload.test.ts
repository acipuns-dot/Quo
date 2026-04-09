import { describe, expect, it } from "vitest";
import { createDefaultDocument } from "../../lib/documents/defaults";
import {
  WORKSPACE_DOCUMENT_PAYLOAD_VERSION,
  deserializeSavedDocumentPayload,
  serializeSavedDocumentPayload,
} from "../../lib/workspace/document-payload";

describe("workspace document payload", () => {
  it("serializes document data with a version", () => {
    const data = createDefaultDocument("invoice");

    expect(serializeSavedDocumentPayload(data)).toEqual({
      version: WORKSPACE_DOCUMENT_PAYLOAD_VERSION,
      data,
    });
  });

  it("rejects unsupported versions during deserialize", () => {
    expect(() =>
      deserializeSavedDocumentPayload({
        version: 999,
        data: createDefaultDocument("invoice"),
      }),
    ).toThrow(/Unsupported document payload version/);
  });
});
