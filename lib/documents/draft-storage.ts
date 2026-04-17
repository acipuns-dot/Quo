import { createDefaultDocument } from "./defaults";
import { documentSchema } from "./schema";
import type { DocumentData, DocumentKind } from "./types";

export const DRAFT_STORAGE_VERSION = 1;

export type StoredDocumentDraft = {
  version: number;
  kind: DocumentKind;
  documentNumberAuto: boolean;
  data: DocumentData;
};

export type StoredSelectedWorkspaceCustomer = {
  id: string;
  name: string;
  address: string;
  selectedAt: string;
};

export type DraftPersistenceMode = "free" | "workspace";

export function getDraftStorageKey(kind: DocumentKind, mode: DraftPersistenceMode = "free", userId?: string) {
  if (mode === "workspace" && userId) {
    return `quo:draft:workspace:${userId}:${kind}`;
  }
  return `quo:draft:${mode}:${kind}`;
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getSelectedCustomerStorageKey(businessId: string) {
  return `quo:workspace:selected-customer:${businessId}`;
}

function isStoredSelectedWorkspaceCustomer(
  value: unknown,
): value is StoredSelectedWorkspaceCustomer {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.address === "string" &&
    typeof candidate.selectedAt === "string"
  );
}

export function saveDraft(
  kind: DocumentKind,
  mode: DraftPersistenceMode,
  payload: StoredDocumentDraft,
  userId?: string,
) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(getDraftStorageKey(kind, mode, userId), JSON.stringify(payload));
  } catch {
    // Ignore storage failures so editing continues normally.
  }
}

export function clearDraft(kind: DocumentKind, mode: DraftPersistenceMode, userId?: string) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.removeItem(getDraftStorageKey(kind, mode, userId));
  } catch {
    // Ignore storage failures so editing continues normally.
  }
}

export function saveSelectedWorkspaceCustomer(
  businessId: string,
  payload: StoredSelectedWorkspaceCustomer,
) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(
      getSelectedCustomerStorageKey(businessId),
      JSON.stringify(payload),
    );
  } catch {
    // Ignore storage failures so editing continues normally.
  }
}

export function loadSelectedWorkspaceCustomer(
  businessId: string,
): StoredSelectedWorkspaceCustomer | null {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(getSelectedCustomerStorageKey(businessId));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as unknown;
    return isStoredSelectedWorkspaceCustomer(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function clearSelectedWorkspaceCustomer(businessId: string) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.removeItem(getSelectedCustomerStorageKey(businessId));
  } catch {
    // Ignore storage failures so editing continues normally.
  }
}

export function loadDraft(
  kind: DocumentKind,
  mode: DraftPersistenceMode,
  userId?: string,
): StoredDocumentDraft | null {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(getDraftStorageKey(kind, mode, userId));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredDocumentDraft>;
    if (
      parsed.version !== DRAFT_STORAGE_VERSION ||
      parsed.kind !== kind ||
      !parsed.data
    ) {
      return null;
    }

    const result = documentSchema.safeParse(parsed.data);
    if (!result.success) {
      return null;
    }

    return {
      version: DRAFT_STORAGE_VERSION,
      kind,
      documentNumberAuto: parsed.documentNumberAuto ?? true,
      data: { ...result.data, kind },
    };
  } catch {
    return null;
  }
}

export function getDraftOrDefault(
  kind: DocumentKind,
  mode: DraftPersistenceMode = "free",
  userId?: string,
): StoredDocumentDraft {
  const restored = loadDraft(kind, mode, userId);
  if (restored) {
    return restored;
  }

  return {
    version: DRAFT_STORAGE_VERSION,
    kind,
    documentNumberAuto: true,
    data: createDefaultDocument(kind),
  };
}
