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

export function getDraftStorageKey(kind: DocumentKind) {
  return `quo:draft:${kind}`;
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function saveDraft(kind: DocumentKind, payload: StoredDocumentDraft) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(getDraftStorageKey(kind), JSON.stringify(payload));
  } catch {
    // Ignore storage failures so editing continues normally.
  }
}

export function clearDraft(kind: DocumentKind) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.removeItem(getDraftStorageKey(kind));
  } catch {
    // Ignore storage failures so editing continues normally.
  }
}

export function loadDraft(kind: DocumentKind): StoredDocumentDraft | null {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(getDraftStorageKey(kind));
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

export function getDraftOrDefault(kind: DocumentKind): StoredDocumentDraft {
  const restored = loadDraft(kind);
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
