import type { DocumentData, DocumentKind } from "../documents/types";

type SaveWorkspaceDocumentInput = {
  kind: DocumentKind;
  customerId: string | null;
  data: DocumentData;
};

async function postWorkspaceDocument(
  url: string,
  status: "draft" | "exported",
  input: SaveWorkspaceDocumentInput,
) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      kind: input.kind,
      customerId: input.customerId,
      status,
      data: input.data,
    }),
  });

  if (!response.ok) {
    throw new Error(`Workspace document save failed with status ${response.status}`);
  }

  return response.json();
}

export function saveWorkspaceDraft(url: string, input: SaveWorkspaceDocumentInput) {
  return postWorkspaceDocument(url, "draft", input);
}

export function saveWorkspaceExport(url: string, input: SaveWorkspaceDocumentInput) {
  return postWorkspaceDocument(url, "exported", input);
}
