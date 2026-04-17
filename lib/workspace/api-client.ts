import type { DocumentData, DocumentKind } from "../documents/types";

type SaveWorkspaceDocumentInput = {
  kind: DocumentKind;
  customerId: string | null;
  data: DocumentData;
};

type BusinessPayload = {
  name: string;
  address: string;
  email: string;
  phone: string;
  taxNumber: string;
  defaultCurrency: string;
  defaultTaxLabel: string;
  defaultTaxRate: number;
  applyTaxByDefault?: boolean;
  defaultPaymentTerms: string;
  logoUrl: string | null;
  notes: string;
};

type CustomerPayload = {
  name: string;
  address: string;
  email: string;
  phone: string;
  taxNumber: string;
  notes: string;
};

type ItemPayload = {
  name: string;
  description: string;
  note: string;
  quantity: number;
  unit: string;
  customUnit: string;
  unitPrice: number;
};

async function jsonRequest(
  url: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
) {
  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error ?? `Workspace request failed with status ${response.status}`);
  }

  return response.json().catch(() => ({}));
}

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
    const payload = await response.json().catch(() => null);
    throw new Error(
      payload?.error ?? `Workspace document save failed with status ${response.status}`,
    );
  }

  return response.json();
}

export function saveWorkspaceDraft(url: string, input: SaveWorkspaceDocumentInput) {
  return postWorkspaceDocument(url, "draft", input);
}

export function saveWorkspaceExport(url: string, input: SaveWorkspaceDocumentInput) {
  return postWorkspaceDocument(url, "exported", input);
}

export function createBusiness(input: BusinessPayload) {
  return jsonRequest("/api/workspace/businesses", "POST", input);
}

export function updateBusiness(businessId: string, input: BusinessPayload) {
  return jsonRequest(`/api/workspace/businesses/${businessId}`, "PATCH", input);
}

export function deleteBusiness(businessId: string, force = false) {
  return jsonRequest(
    `/api/workspace/businesses/${businessId}?force=${force ? "1" : "0"}`,
    "DELETE",
  );
}

export function createCustomer(businessId: string, input: CustomerPayload) {
  return jsonRequest(`/api/workspace/businesses/${businessId}/customers`, "POST", input);
}

export function updateCustomer(
  businessId: string,
  customerId: string,
  input: CustomerPayload,
) {
  return jsonRequest(
    `/api/workspace/businesses/${businessId}/customers/${customerId}`,
    "PATCH",
    input,
  );
}

export function deleteCustomer(businessId: string, customerId: string) {
  return jsonRequest(
    `/api/workspace/businesses/${businessId}/customers/${customerId}`,
    "DELETE",
  );
}

export function createItem(businessId: string, input: ItemPayload) {
  return jsonRequest(`/api/workspace/businesses/${businessId}/items`, "POST", input);
}

export function updateItem(businessId: string, itemId: string, input: ItemPayload) {
  return jsonRequest(
    `/api/workspace/businesses/${businessId}/items/${itemId}`,
    "PATCH",
    input,
  );
}

export function deleteItem(businessId: string, itemId: string) {
  return jsonRequest(
    `/api/workspace/businesses/${businessId}/items/${itemId}`,
    "DELETE",
  );
}
