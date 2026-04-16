"use client";

import React, { useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import {
  clearDraft,
  clearSelectedWorkspaceCustomer,
  DRAFT_STORAGE_VERSION,
  getDraftOrDefault,
  loadSelectedWorkspaceCustomer,
  saveDraft,
  saveSelectedWorkspaceCustomer,
  type DraftPersistenceMode,
  type StoredDocumentDraft,
  type StoredSelectedWorkspaceCustomer,
} from "../../lib/documents/draft-storage";
import { generateDocumentNumber } from "../../lib/documents/document-number";
import { exportDocumentToPdf } from "../../lib/documents/pdf-export";
import { getPaymentTermSummary } from "../../lib/documents/calculations";
import { formatCurrency } from "../../lib/documents/format";
import { BUILT_IN_LINE_ITEM_UNITS } from "../../lib/documents/line-items";
import { getTemplatesForKind, THEMES } from "../../lib/documents/templates";
import type {
  AdditionalFee,
  DocumentData,
  DocumentKind,
  LineItem,
  PaymentTermPreset,
} from "../../lib/documents/types";
import { documentSchema } from "../../lib/documents/schema";
import { saveWorkspaceDraft, saveWorkspaceExport } from "../../lib/workspace/api-client";
import { findMatchingCustomers } from "../../lib/workspace/customer-search";
import { deserializeSavedDocumentPayload } from "../../lib/workspace/document-payload";
import type { WorkspaceDocumentAction } from "../../lib/workspace/sidebar-actions";
import { PreviewPanel } from "./preview-panel";
import { LogoUpload } from "./logo-upload";
import { CustomerAutosuggest, type CustomerOption } from "../workspace/customer-autosuggest";

// ─── helpers ────────────────────────────────────────────────────────────────

type FieldErrors = Record<string, string>;
type SelectedWorkspaceCustomer = StoredSelectedWorkspaceCustomer;

function buildErrors(data: DocumentData): FieldErrors {
  const result = documentSchema.safeParse(data);
  if (result.success) return {};
  return result.error.issues.reduce<FieldErrors>((errors, issue) => {
    const path = issue.path.join(".");
    if (!path || path in errors) return errors;
    errors[path] = issue.message;
    return errors;
  }, {});
}

function getNumericValue(value: string): number {
  if (value.trim() === "") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function nextLineItemId(nextId: number): string {
  return `line-${nextId}`;
}

function getNextLineItemSeed(items: LineItem[]): number {
  const maxId = items.reduce((max, item) => {
    const match = /^line-(\d+)$/.exec(item.id);
    const numericId = match ? Number(match[1]) : 0;
    return Number.isFinite(numericId) ? Math.max(max, numericId) : max;
  }, 0);

  return Math.max(maxId + 1, items.length + 1, 2);
}

function nextAdditionalFeeId(nextId: number): string {
  return `fee-${nextId}`;
}

function getNextAdditionalFeeSeed(fees: AdditionalFee[]): number {
  const maxId = fees.reduce((max, fee) => {
    const match = /^fee-(\d+)$/.exec(fee.id);
    const numericId = match ? Number(match[1]) : 0;
    return Number.isFinite(numericId) ? Math.max(max, numericId) : max;
  }, 0);

  return Math.max(maxId + 1, fees.length + 1, 2);
}

function getPresetPercentage(preset: DocumentData["paymentTermPreset"]): number | null {
  switch (preset) {
    case "full":
      return 100;
    case "half":
      return 50;
    case "deposit_30":
      return 30;
    case "deposit_40":
      return 40;
    case "deposit_50":
      return 50;
    default:
      return null;
  }
}

// ─── small UI pieces ─────────────────────────────────────────────────────────

const labelClass = "block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40 mb-1";
const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-[#faf9f7] placeholder:text-white/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus:border-[#d4901e]/60 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-[#d4901e]/15";

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-600">{msg}</p>;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
    </svg>
  );
}

const PAYMENT_TERM_OPTIONS: Array<{
  value: PaymentTermPreset | "";
  label: string;
}> = [
  { value: "", label: "No payment term" },
  { value: "full", label: "Full payment (100%)" },
  { value: "half", label: "Half payment (50%)" },
  { value: "deposit_30", label: "30% deposit" },
  { value: "deposit_40", label: "40% deposit" },
  { value: "deposit_50", label: "50% deposit" },
  { value: "custom", label: "Custom" },
];

const LINE_ITEM_UNIT_OPTIONS = BUILT_IN_LINE_ITEM_UNITS.map((value) => ({
  value,
  label:
    value === ""
      ? "No unit"
      : value === "custom"
        ? "Custom..."
        : value,
}));

function PaymentTermPresetDropdown({
  value,
  onSelect,
}: {
  value: PaymentTermPreset | "";
  onSelect: (value: PaymentTermPreset | "") => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedLabel =
    PAYMENT_TERM_OPTIONS.find((option) => option.value === value)?.label ?? "No payment term";

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Payment term preset"
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`${inputClass} flex items-center justify-between text-left`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{selectedLabel}</span>
        <ChevronIcon open={open} />
      </button>
      {open ? (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-[#d4901e]/30 bg-[#161616] shadow-[0_14px_36px_rgba(0,0,0,0.45)]">
          <div role="listbox" aria-label="Payment term preset options" className="py-1.5">
            {PAYMENT_TERM_OPTIONS.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value || "none"}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`flex w-full items-center justify-between px-3 py-2.5 text-sm transition-colors ${
                    isSelected
                      ? "bg-[#d4901e]/18 text-[#faf9f7]"
                      : "text-[#faf9f7] hover:bg-white/[0.06]"
                  }`}
                  onClick={() => {
                    onSelect(option.value);
                    setOpen(false);
                  }}
                >
                  <span>{option.label}</span>
                  {isSelected ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2.5 6L5 8.5L9.5 3.5"
                        stroke="#d4901e"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function LineItemUnitDropdown({
  value,
  onSelect,
  ariaLabel,
}: {
  value: LineItem["unit"];
  onSelect: (value: LineItem["unit"]) => void;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedLabel =
    LINE_ITEM_UNIT_OPTIONS.find((option) => option.value === value)?.label ?? "No unit";

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`${inputClass} flex items-center justify-between text-left`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{selectedLabel}</span>
        <ChevronIcon open={open} />
      </button>
      {open ? (
        <div className="absolute z-20 mt-2 max-h-80 w-full overflow-hidden rounded-xl border border-[#d4901e]/30 bg-[#161616] shadow-[0_14px_36px_rgba(0,0,0,0.45)]">
          <div role="listbox" aria-label={`${ariaLabel} options`} className="max-h-80 overflow-y-auto py-1.5">
            {LINE_ITEM_UNIT_OPTIONS.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value || "none"}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`flex w-full items-center justify-between px-3 py-2.5 text-sm transition-colors ${
                    isSelected
                      ? "bg-[#d4901e]/18 text-[#faf9f7]"
                      : "text-[#faf9f7] hover:bg-white/[0.06]"
                  }`}
                  onClick={() => {
                    onSelect(option.value);
                    setOpen(false);
                  }}
                >
                  <span>{option.label}</span>
                  {isSelected ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2.5 6L5 8.5L9.5 3.5"
                        stroke="#d4901e"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TemplateColorPicker({
  templateId,
  selectedThemeId,
  onSelectTheme,
}: {
  templateId: string;
  selectedThemeId: string;
  onSelectTheme: (themeId: string) => void;
}) {
  return (
    <div
      data-testid={`template-colors-${templateId}`}
      className="mt-2 rounded-b-[14px] border-t border-white/[0.08] bg-white/[0.03] px-2.5 py-3"
    >
      <p className="mb-2 text-[8px] font-bold uppercase tracking-[0.22em] text-white/25">
        Pick colour
      </p>
      <div className="grid grid-cols-3 gap-x-1 gap-y-3">
        {THEMES.map((theme) => {
          const isSelected = selectedThemeId === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              title={theme.label}
              onClick={() => onSelectTheme(theme.id)}
              aria-label={`${theme.label} colour`}
              aria-pressed={isSelected}
              className="flex flex-col items-center gap-1.5 cursor-pointer group focus:outline-none"
            >
              <div className="relative flex items-center justify-center">
                {isSelected && (
                  <span
                    className="absolute inset-[-4px] rounded-full"
                    style={{ boxShadow: `0 0 0 2px ${theme.accent}` }}
                  />
                )}
                <div
                  className="w-8 h-8 rounded-full transition-transform duration-150 group-hover:scale-110"
                  style={{
                    backgroundColor: theme.accent,
                    boxShadow: isSelected
                      ? `0 2px 10px ${theme.accent}55`
                      : "0 1px 4px rgba(0,0,0,0.18)",
                  }}
                />
                {isSelected && (
                  <svg
                    className="absolute w-3.5 h-3.5 text-white pointer-events-none"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M2.5 6l2.5 2.5 4.5-5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span
                className="text-[8px] font-semibold uppercase tracking-wide leading-none transition-colors"
                style={{ color: isSelected ? theme.accent : "#bbb6b1" }}
              >
                {theme.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

const DOC_KINDS: DocumentKind[] = ["quotation", "invoice", "receipt"];
const KIND_LABELS: Record<DocumentKind, string> = {
  quotation: "Quotation",
  invoice: "Invoice",
  receipt: "Receipt",
};

const SECTION_TITLES = ["Your business", "Client", "Document details", "Line items", "Notes"];
const TOTAL_SECTIONS = 5;

type WorkspaceGeneratorContext = {
  businessId: string;
  businessName: string;
  businessAddress: string;
  defaultCurrency: string;
  defaultTaxLabel: string;
  defaultTaxRate: number;
  applyTaxByDefault?: boolean;
  defaultPaymentTerms: string;
  apiBasePath?: string;
  customerOptions?: CustomerOption[];
  persistenceMode?: "workspace";
};

function getWorkspacePaymentTermState(defaultPaymentTerms: string) {
  if (!defaultPaymentTerms) {
    return {
      paymentTermPreset: "" as PaymentTermPreset | "",
      paymentTermLabel: "",
      paymentTermPercentage: null,
    };
  }

  return {
    paymentTermPreset: "custom" as PaymentTermPreset | "",
    paymentTermLabel: defaultPaymentTerms,
    paymentTermPercentage: 50,
  };
}

function applyWorkspaceBusinessDefaults(
  draft: StoredDocumentDraft,
  workspace: WorkspaceGeneratorContext,
): StoredDocumentDraft {
  const paymentTermState = getWorkspacePaymentTermState(workspace.defaultPaymentTerms);

  return {
    ...draft,
    data: {
      ...draft.data,
      businessName: workspace.businessName,
      businessAddress: workspace.businessAddress,
      currency: workspace.defaultCurrency,
      applyTax: workspace.applyTaxByDefault ?? true,
      taxLabel: workspace.defaultTaxLabel,
      taxRate: workspace.defaultTaxRate,
      paymentTermPreset: paymentTermState.paymentTermPreset,
      paymentTermPercentage: paymentTermState.paymentTermPercentage,
      paymentTermLabel: paymentTermState.paymentTermLabel,
    },
  };
}

function applySelectedCustomer(
  draft: StoredDocumentDraft,
  selectedCustomer: SelectedWorkspaceCustomer | null,
): StoredDocumentDraft {
  if (!selectedCustomer) {
    return draft;
  }

  return {
    ...draft,
    data: {
      ...draft.data,
      customerName: selectedCustomer.name,
      customerAddress: selectedCustomer.address,
    },
  };
}

function resolveValidSelectedCustomer(
  selectedCustomer: SelectedWorkspaceCustomer | null,
  workspace?: WorkspaceGeneratorContext,
) {
  if (!selectedCustomer || !workspace?.customerOptions) {
    return selectedCustomer;
  }

  const match = workspace.customerOptions.find((option) => option.id === selectedCustomer.id);
  if (!match) {
    return null;
  }

  return {
    id: match.id,
    name: match.name,
    address: match.address,
    selectedAt: selectedCustomer.selectedAt,
  };
}

function restoreSelectedWorkspaceCustomer(
  workspace?: WorkspaceGeneratorContext,
) {
  if (!workspace) {
    return null;
  }

  const storedSelectedCustomer = loadSelectedWorkspaceCustomer(workspace.businessId);
  const validSelectedCustomer = resolveValidSelectedCustomer(
    storedSelectedCustomer,
    workspace,
  );

  if (storedSelectedCustomer && !validSelectedCustomer) {
    clearSelectedWorkspaceCustomer(workspace.businessId);
  }

  return validSelectedCustomer;
}

function getInitialDraft(
  initialKind: DocumentKind,
  workspace?: WorkspaceGeneratorContext,
  persistenceMode: DraftPersistenceMode = "free",
): StoredDocumentDraft {
  const initialDraft = getDraftOrDefault(initialKind, persistenceMode);

  if (!workspace) {
    return initialDraft;
  }

  return applySelectedCustomer(
    applyWorkspaceBusinessDefaults(initialDraft, workspace),
    restoreSelectedWorkspaceCustomer(workspace),
  );
}

function getWorkspaceAdjustedDraft(
  kind: DocumentKind,
  persistenceMode: DraftPersistenceMode,
  workspace?: WorkspaceGeneratorContext,
  selectedCustomer?: SelectedWorkspaceCustomer | null,
): StoredDocumentDraft {
  const draft = getDraftOrDefault(kind, persistenceMode);

  if (!workspace) {
    return draft;
  }

  const validSelectedCustomer = resolveValidSelectedCustomer(selectedCustomer ?? null, workspace);

  return applySelectedCustomer(
    applyWorkspaceBusinessDefaults(draft, workspace),
    validSelectedCustomer,
  );
}

function shouldAutoGenerateDocumentNumber(kind: DocumentKind, data: DocumentData) {
  return data.documentNumber === generateDocumentNumber(kind, data.documentDate);
}

function serializeDraftSnapshot(input: {
  kind: DocumentKind;
  data: DocumentData;
  documentNumberAuto: boolean;
  selectedCustomerId: string | null;
  businessId: string | null;
}) {
  return JSON.stringify(input);
}

export type DocumentGeneratorHandle = {
  saveCurrentDraft: () => Promise<{ ok: boolean; errorMessage?: string }>;
};

type DocumentGeneratorProps = {
  kind: DocumentKind;
  workspace?: WorkspaceGeneratorContext;
  workspaceAction?: WorkspaceDocumentAction | null;
  onWorkspaceActionHandled?: (actionId: string) => void;
  onDirtyChange?: (dirty: boolean) => void;
};

export const DocumentGenerator = React.forwardRef<DocumentGeneratorHandle, DocumentGeneratorProps>(
function DocumentGenerator({
  kind: initialKind,
  workspace,
  workspaceAction,
  onWorkspaceActionHandled,
  onDirtyChange,
}: DocumentGeneratorProps, ref) {
  const persistenceMode = workspace?.persistenceMode ?? "free";
  const initialDraftRef = useRef<StoredDocumentDraft | null>(null);
  if (initialDraftRef.current === null) {
    initialDraftRef.current = getInitialDraft(initialKind, workspace, persistenceMode);
  }
  const initialSelectedWorkspaceCustomer = restoreSelectedWorkspaceCustomer(workspace);
  const initialSelectedCustomerId = initialSelectedWorkspaceCustomer?.id ?? null;

  const [currentKind, setCurrentKind] = useState<DocumentKind>(initialKind);
  const [data, setData] = useState<DocumentData>(initialDraftRef.current.data);
  const [documentNumberAuto, setDocumentNumberAuto] = useState(
    initialDraftRef.current.documentNumberAuto,
  );
  const [activeSection, setActiveSection] = useState(1);
  const [doneSet, setDoneSet] = useState<Set<number>>(new Set());
  const [logoError, setLogoError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [selectedWorkspaceCustomer, setSelectedWorkspaceCustomer] =
    useState<SelectedWorkspaceCustomer | null>(initialSelectedWorkspaceCustomer);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(initialSelectedCustomerId);
  const previewRef = useRef<HTMLDivElement>(null);
  const lastTaxValuesRef = useRef({
    taxLabel: initialDraftRef.current.data.taxLabel,
    taxRate: initialDraftRef.current.data.taxRate,
  });
  const nextLineItemIdRef = useRef(getNextLineItemSeed(initialDraftRef.current.data.lineItems));
  const nextAdditionalFeeIdRef = useRef(
    getNextAdditionalFeeSeed(initialDraftRef.current.data.additionalFees),
  );
  const skipAutosaveKindRef = useRef<DocumentKind | null>(null);
  const previousBusinessIdRef = useRef(workspace?.businessId ?? null);
  const lastHandledWorkspaceActionIdRef = useRef<string | null>(null);
  const baselineSnapshotRef = useRef(
    serializeDraftSnapshot({
      kind: initialKind,
      data: initialDraftRef.current.data,
      documentNumberAuto: initialDraftRef.current.documentNumberAuto,
      selectedCustomerId: initialSelectedCustomerId,
      businessId: workspace?.businessId ?? null,
    }),
  );

  const errors = useMemo(() => buildErrors(data), [data]);
  const showLineItems = currentKind !== "receipt";
  const currentSnapshot = useMemo(
    () =>
      serializeDraftSnapshot({
        kind: currentKind,
        data,
        documentNumberAuto,
        selectedCustomerId,
        businessId: workspace?.businessId ?? null,
      }),
    [currentKind, data, documentNumberAuto, selectedCustomerId, workspace?.businessId],
  );
  const matchingCustomerOptions = useMemo(() => {
    if (!workspace?.customerOptions?.length) {
      return [];
    }

    const matchingCustomers = findMatchingCustomers(
      workspace.customerOptions.map((customer) => ({
        id: customer.id,
        businessId: workspace.businessId,
        name: customer.name,
        address: customer.address,
        email: "",
        phone: "",
        taxNumber: "",
        notes: "",
        createdAt: "",
        updatedAt: "",
      })),
      data.customerName,
    );

    return matchingCustomers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      address: customer.address,
    }));
  }, [data.customerName, workspace]);
  const templates = getTemplatesForKind(currentKind);
  const selectedTemplateDefinition =
    templates.find((template) => template.id === data.templateId) ?? templates[0];

  useEffect(() => {
    onDirtyChange?.(currentSnapshot !== baselineSnapshotRef.current);
  }, [currentSnapshot, onDirtyChange]);

  useEffect(() => {
    if (saveState === "saving") {
      return;
    }

    setSaveState(currentSnapshot === baselineSnapshotRef.current ? "saved" : "idle");
  }, [currentSnapshot, saveState]);

  useEffect(() => {
    if (!documentNumberAuto) {
      return;
    }

    const generatedDocumentNumber = generateDocumentNumber(
      currentKind,
      data.documentDate,
    );

    setData((prev) =>
      prev.documentNumber === generatedDocumentNumber
        ? prev
        : { ...prev, documentNumber: generatedDocumentNumber },
    );
  }, [currentKind, data.documentDate, documentNumberAuto]);

  useEffect(() => {
    if (!workspace || !selectedWorkspaceCustomer) {
      return;
    }

    saveSelectedWorkspaceCustomer(workspace.businessId, selectedWorkspaceCustomer);
  }, [selectedWorkspaceCustomer, workspace]);

  useEffect(() => {
    if (!data.applyTax) {
      lastTaxValuesRef.current = {
        taxLabel: data.taxLabel,
        taxRate: data.taxRate,
      };
    }
  }, [data.applyTax, data.taxLabel, data.taxRate]);

  useEffect(() => {
    const nextBusinessId = workspace?.businessId ?? null;

    if (previousBusinessIdRef.current !== nextBusinessId) {
      previousBusinessIdRef.current = nextBusinessId;
      const restoredSelectedCustomer = restoreSelectedWorkspaceCustomer(workspace);

      setSelectedWorkspaceCustomer(restoredSelectedCustomer);
      setSelectedCustomerId(restoredSelectedCustomer?.id ?? null);
      setData((prev) => {
        if (!workspace) {
          return prev;
        }

        return applySelectedCustomer(
          applyWorkspaceBusinessDefaults(
            {
              version: DRAFT_STORAGE_VERSION,
              kind: currentKind,
              documentNumberAuto,
              data: prev,
            },
            workspace,
          ),
          restoredSelectedCustomer,
        ).data;
      });
      baselineSnapshotRef.current = serializeDraftSnapshot({
        kind: currentKind,
        data: applySelectedCustomer(
          applyWorkspaceBusinessDefaults(
            {
              version: DRAFT_STORAGE_VERSION,
              kind: currentKind,
              documentNumberAuto,
              data,
            },
            workspace ?? {
              businessId: "",
              businessName: "",
              businessAddress: "",
              defaultCurrency: "USD",
              defaultTaxLabel: "Tax",
              defaultTaxRate: 0,
              applyTaxByDefault: true,
              defaultPaymentTerms: "",
            },
          ),
          restoredSelectedCustomer,
        ).data,
        documentNumberAuto,
        selectedCustomerId: restoredSelectedCustomer?.id ?? null,
        businessId: nextBusinessId,
      });
    }
  }, [currentKind, data, documentNumberAuto, workspace]);

  useEffect(() => {
    const validSelectedCustomer = resolveValidSelectedCustomer(
      selectedWorkspaceCustomer,
      workspace,
    );

    if (validSelectedCustomer || !selectedWorkspaceCustomer) {
      return;
    }

    if (workspace) {
      clearSelectedWorkspaceCustomer(workspace.businessId);
    }
    setSelectedWorkspaceCustomer(null);
    setSelectedCustomerId(null);
  }, [selectedWorkspaceCustomer, workspace]);

  // ── handlers ──────────────────────────────────────────────────────────────

  function update<K extends keyof DocumentData>(key: K, value: DocumentData[K]) {
    if (key === "documentNumber") {
      setDocumentNumberAuto(false);
    }

    if (
      workspace &&
      selectedWorkspaceCustomer &&
      (key === "customerName" || key === "customerAddress")
    ) {
      const nextValue = String(value);
      const currentSavedValue =
        key === "customerName"
          ? selectedWorkspaceCustomer.name
          : selectedWorkspaceCustomer.address;

      if (nextValue !== currentSavedValue) {
        setSelectedWorkspaceCustomer(null);
        setSelectedCustomerId(null);
        clearSelectedWorkspaceCustomer(workspace.businessId);
      }
    }

    setData((prev) => ({ ...prev, [key]: value }));
  }

  function toggleApplyTax(nextValue: boolean) {
    if (!nextValue) {
      lastTaxValuesRef.current = {
        taxLabel: data.taxLabel,
        taxRate: data.taxRate,
      };
      update("applyTax", false);
      return;
    }

    update("taxLabel", lastTaxValuesRef.current.taxLabel || workspace?.defaultTaxLabel || "Tax");
    update(
      "taxRate",
      lastTaxValuesRef.current.taxRate || workspace?.defaultTaxRate || 0,
    );
    update("applyTax", true);
  }

  function updateLineItem(index: number, key: keyof LineItem, value: LineItem[keyof LineItem]) {
    setData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item, i) => {
        if (i !== index) return item;

        if (key === "unit" && value !== "custom") {
          return { ...item, unit: value as LineItem["unit"], customUnit: "" };
        }

        return { ...item, [key]: value };
      }),
    }));
  }

  function updateAdditionalFee(
    index: number,
    key: keyof AdditionalFee,
    value: AdditionalFee[keyof AdditionalFee],
  ) {
    setData((prev) => ({
      ...prev,
      additionalFees: prev.additionalFees.map((fee, i) =>
        i === index ? { ...fee, [key]: value } : fee,
      ),
    }));
  }

  function addLineItem() {
    setData((prev) => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        {
          id: nextLineItemId(nextLineItemIdRef.current++),
          description: "",
          note: "",
          quantity: 1,
          unit: "",
          customUnit: "",
          unitPrice: 0,
        },
      ],
    }));
  }

  function removeLineItem(index: number) {
    setData((prev) => {
      if (prev.lineItems.length === 1) return prev;
      return { ...prev, lineItems: prev.lineItems.filter((_, i) => i !== index) };
    });
  }

  function addAdditionalFee() {
    setData((prev) => ({
      ...prev,
      additionalFees: [
        ...prev.additionalFees,
        {
          id: nextAdditionalFeeId(nextAdditionalFeeIdRef.current++),
          label: "",
          amount: 0,
        },
      ],
    }));
  }

  function removeAdditionalFee(index: number) {
    setData((prev) => ({
      ...prev,
      additionalFees: prev.additionalFees.filter((_, i) => i !== index),
    }));
  }

  function switchKind(kind: DocumentKind) {
    saveDraft(currentKind, persistenceMode, {
      version: DRAFT_STORAGE_VERSION,
      kind: currentKind,
      documentNumberAuto,
      data,
    });

    const nextSelectedCustomer = resolveValidSelectedCustomer(
      (workspace ? loadSelectedWorkspaceCustomer(workspace.businessId) : null) ??
        selectedWorkspaceCustomer,
      workspace,
    );

    const nextDraft = getWorkspaceAdjustedDraft(
      kind,
      persistenceMode,
      workspace,
      nextSelectedCustomer,
    );

    setCurrentKind(kind);
    setData(nextDraft.data);
    setSelectedWorkspaceCustomer(nextSelectedCustomer);
    setSelectedCustomerId(nextSelectedCustomer?.id ?? null);
    setDocumentNumberAuto(nextDraft.documentNumberAuto);
    nextLineItemIdRef.current = getNextLineItemSeed(nextDraft.data.lineItems);
    nextAdditionalFeeIdRef.current = getNextAdditionalFeeSeed(nextDraft.data.additionalFees);
    setActiveSection(1);
    setDoneSet(new Set());
    baselineSnapshotRef.current = serializeDraftSnapshot({
      kind,
      data: nextDraft.data,
      documentNumberAuto: nextDraft.documentNumberAuto,
      selectedCustomerId: nextSelectedCustomer?.id ?? null,
      businessId: workspace?.businessId ?? null,
    });
  }

  function handleClearDraft() {
    clearDraft(currentKind, persistenceMode);
    skipAutosaveKindRef.current = currentKind;

    const nextSelectedCustomer = workspace ? restoreSelectedWorkspaceCustomer(workspace) : null;
    const freshDraft = getWorkspaceAdjustedDraft(
      currentKind,
      persistenceMode,
      workspace,
      nextSelectedCustomer,
    );

    setData(freshDraft.data);
    setSelectedWorkspaceCustomer(nextSelectedCustomer);
    setSelectedCustomerId(nextSelectedCustomer?.id ?? null);
    setDocumentNumberAuto(freshDraft.documentNumberAuto);
    nextLineItemIdRef.current = getNextLineItemSeed(freshDraft.data.lineItems);
    nextAdditionalFeeIdRef.current = getNextAdditionalFeeSeed(freshDraft.data.additionalFees);
    setActiveSection(1);
    setDoneSet(new Set());
    baselineSnapshotRef.current = serializeDraftSnapshot({
      kind: currentKind,
      data: freshDraft.data,
      documentNumberAuto: freshDraft.documentNumberAuto,
      selectedCustomerId: nextSelectedCustomer?.id ?? null,
      businessId: workspace?.businessId ?? null,
    });
    setSaveState(workspace?.apiBasePath ? "saved" : "idle");
  }

  function markDone(sectionNum: number) {
    setDoneSet((prev) => {
      const next = new Set(prev);
      next.add(sectionNum);
      return next;
    });
    // For receipt, skip section 4
    let nextSection = sectionNum + 1;
    if (!showLineItems && nextSection === 4) nextSection = 5;
    if (nextSection <= TOTAL_SECTIONS) {
      setActiveSection(nextSection);
    }
  }

  function openSection(sectionNum: number) {
    setActiveSection(sectionNum);
  }

  function getSectionState(n: number): "pending" | "active" | "done" {
    if (activeSection === n) return "active";
    if (doneSet.has(n)) return "done";
    return "pending";
  }

  async function handleDownloadPdf() {
    if (!previewRef.current) return;
    await exportDocumentToPdf({
      data,
      previewNode: previewRef.current,
      filename: `${(data.customerName || "customer").toLowerCase().replace(/\s+/g, "-")}-${data.documentNumber || "document"}.pdf`,
    });
    if (workspace?.apiBasePath) {
      await saveWorkspaceExport(workspace.apiBasePath, {
        kind: currentKind,
        customerId: selectedCustomerId,
        data,
      });
    }
  }

  async function saveCurrentWorkspaceDraft() {
    if (!workspace?.apiBasePath) {
      return { ok: false as const };
    }

    setSaveState("saving");

    try {
      await saveWorkspaceDraft(workspace.apiBasePath, {
        kind: currentKind,
        customerId: selectedCustomerId,
        data,
      });
      baselineSnapshotRef.current = serializeDraftSnapshot({
        kind: currentKind,
        data,
        documentNumberAuto,
        selectedCustomerId,
        businessId: workspace.businessId ?? null,
      });
      setSaveState("saved");
      return { ok: true as const };
    } catch (error) {
      setSaveState("error");
      return {
        ok: false as const,
        errorMessage: error instanceof Error ? error.message : "Save failed. Please try again.",
      };
    }
  }

  useImperativeHandle(ref, () => ({
    saveCurrentDraft: saveCurrentWorkspaceDraft,
  }));

  useEffect(() => {
    if (!workspaceAction || lastHandledWorkspaceActionIdRef.current === workspaceAction.id) {
      return;
    }

    lastHandledWorkspaceActionIdRef.current = workspaceAction.id;

    if (workspaceAction.kind === "customer") {
      const nextSelectedCustomer: SelectedWorkspaceCustomer = {
        id: workspaceAction.customer.id,
        name: workspaceAction.customer.name,
        address: workspaceAction.customer.address,
        selectedAt: new Date().toISOString(),
      };
      const nextData = {
        ...data,
        customerName: nextSelectedCustomer.name,
        customerAddress: nextSelectedCustomer.address,
      };

      setData(nextData);
      setSelectedWorkspaceCustomer(nextSelectedCustomer);
      setSelectedCustomerId(nextSelectedCustomer.id);
      setActiveSection(2);
      baselineSnapshotRef.current = serializeDraftSnapshot({
        kind: currentKind,
        data: nextData,
        documentNumberAuto,
        selectedCustomerId: nextSelectedCustomer.id,
        businessId: workspace?.businessId ?? null,
      });
      saveDraft(currentKind, persistenceMode, {
        version: DRAFT_STORAGE_VERSION,
        kind: currentKind,
        documentNumberAuto,
        data: nextData,
      });
      onWorkspaceActionHandled?.(workspaceAction.id);
      return;
    }

    if (!workspaceAction.document.payload) {
      onWorkspaceActionHandled?.(workspaceAction.id);
      return;
    }

    try {
        const restoredData = deserializeSavedDocumentPayload(
          workspaceAction.document.payload,
          workspaceAction.document.status,
        );
      const nextKind = workspaceAction.document.kind;
      const matchedCustomer =
        workspaceAction.document.customerId && workspace?.customerOptions
          ? workspace.customerOptions.find((customer) => customer.id === workspaceAction.document.customerId) ?? null
          : null;
      const nextSelectedCustomer = matchedCustomer
        ? {
            id: matchedCustomer.id,
            name: matchedCustomer.name,
            address: matchedCustomer.address,
            selectedAt: new Date().toISOString(),
          }
        : null;
      const nextSelectedCustomerId = nextSelectedCustomer?.id ?? workspaceAction.document.customerId ?? null;
      const nextDocumentNumberAuto = shouldAutoGenerateDocumentNumber(nextKind, restoredData);

      setCurrentKind(nextKind);
      setData(restoredData);
      setDocumentNumberAuto(nextDocumentNumberAuto);
      setSelectedWorkspaceCustomer(nextSelectedCustomer);
      setSelectedCustomerId(nextSelectedCustomerId);
      setActiveSection(1);
      setDoneSet(new Set());
      nextLineItemIdRef.current = getNextLineItemSeed(restoredData.lineItems);
      nextAdditionalFeeIdRef.current = getNextAdditionalFeeSeed(restoredData.additionalFees);
      baselineSnapshotRef.current = serializeDraftSnapshot({
        kind: nextKind,
        data: restoredData,
        documentNumberAuto: nextDocumentNumberAuto,
        selectedCustomerId: nextSelectedCustomerId,
        businessId: workspace?.businessId ?? null,
      });
      saveDraft(nextKind, persistenceMode, {
        version: DRAFT_STORAGE_VERSION,
        kind: nextKind,
        documentNumberAuto: nextDocumentNumberAuto,
        data: restoredData,
      });
    } catch {
      // Ignore malformed saved payloads so the workspace stays usable.
    } finally {
      onWorkspaceActionHandled?.(workspaceAction.id);
    }
  }, [
    currentKind,
    data,
    documentNumberAuto,
    onWorkspaceActionHandled,
    persistenceMode,
    workspace,
    workspaceAction,
  ]);

  useEffect(() => {
    if (skipAutosaveKindRef.current === currentKind) {
      skipAutosaveKindRef.current = null;
      return;
    }

    const timeout = window.setTimeout(() => {
      saveDraft(currentKind, persistenceMode, {
        version: DRAFT_STORAGE_VERSION,
        kind: currentKind,
        documentNumberAuto,
        data,
      });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [currentKind, data, documentNumberAuto, persistenceMode]);

  // ── progress dots ──────────────────────────────────────────────────────────

  const progressDots = Array.from({ length: TOTAL_SECTIONS }, (_, i) => {
    const n = i + 1;
    const state = getSectionState(n);
    return { n, state };
  });

  // ── section summaries ──────────────────────────────────────────────────────

  function getSummary(n: number): string {
    switch (n) {
      case 1: return data.businessName || "—";
      case 2: return data.customerName || "—";
      case 3: return `${data.documentNumber || "—"} · ${data.documentDate || "—"}`;
      case 4: return `${data.lineItems.length} item${data.lineItems.length !== 1 ? "s" : ""}`;
      case 5: return data.notes ? data.notes.slice(0, 30) + (data.notes.length > 30 ? "…" : "") : "No notes";
      default: return "";
    }
  }

  // ─── render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-1 flex-col overflow-hidden min-h-0">
      {/* Doc type bar */}
      <div className="bg-[#111111] border-b border-white/[0.07] px-5 py-2.5 flex items-center justify-between flex-shrink-0 no-print">
        {/* Tabs */}
        <div className="flex items-center gap-1">
          {DOC_KINDS.map((k) => {
            const isActive = k === currentKind;
            return (
              <button
                key={k}
                type="button"
                onClick={() => switchKind(k)}
                className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#d4901e] text-[#111111] font-semibold"
                    : "text-white/40 hover:bg-white/[0.07] hover:text-white/80"
                }`}
              >
                {KIND_LABELS[k]}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClearDraft}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-sm font-semibold text-white/60 bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] hover:text-white/85 transition-all"
          >
            Clear draft
          </button>
          {workspace?.apiBasePath ? (
            <button
              type="button"
              onClick={() => void saveCurrentWorkspaceDraft()}
              disabled={saveState === "saving"}
              className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-sm font-semibold text-white transition-all hover:border-[#d4901e]/40 hover:text-[#d4901e] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveState === "saving"
                ? "Saving..."
                : saveState === "saved"
                  ? "Saved"
                  : saveState === "error"
                    ? "Save failed"
                    : "Save"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-sm font-semibold text-[#111111] bg-[#d4901e] hover:brightness-110 transition-all shadow-[0_4px_14px_rgba(212,144,30,0.3)]"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download PDF
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-[400px_1fr] flex-1 min-h-0 overflow-hidden">
        {/* LEFT: form panel */}
        <div className="bg-[#111111] border-r border-white/[0.07] overflow-y-auto flex flex-col no-print">
          {/* Progress dots */}
          <div className="flex gap-2 items-center px-5 py-3 border-b border-white/[0.06] flex-shrink-0">
            <div className="flex gap-1.5 items-center flex-1">
              {progressDots.map(({ n, state }) => (
                <div
                  key={n}
                  className={`rounded-full transition-all ${
                    state === "active"
                      ? "w-4 h-1.5 bg-[#faf9f7]"
                      : state === "done"
                      ? "w-2.5 h-1.5 bg-[#d4901e]"
                      : "w-2.5 h-1.5 bg-white/15"
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-white/30 font-medium">
              Step {Math.min(activeSection, TOTAL_SECTIONS)} of {TOTAL_SECTIONS}
            </span>
          </div>

          {/* Accordion sections */}
          <div className="flex-1">
            {SECTION_TITLES.map((title, idx) => {
              const n = idx + 1;
              // For receipt, skip rendering section 4 (line items)
              if (!showLineItems && n === 4) return null;
              const state = getSectionState(n);
              const isActive = state === "active";
              const isDone = state === "done";
              const buttonId = `section-trigger-${n}`;
              const panelId = `section-panel-${n}`;

              return (
                <div key={n} className="border-b border-white/[0.06]">
                  {/* Section header */}
                  <button
                    type="button"
                    onClick={() => openSection(n)}
                    aria-expanded={isActive}
                    aria-controls={panelId}
                    id={buttonId}
                    className="w-full flex items-center gap-2.5 px-5 py-3.5 cursor-pointer hover:bg-white/[0.03] transition-colors text-left"
                  >
                    {/* Number / state circle */}
                    <div
                      className={`flex-shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-bold leading-none transition-colors ${
                        isDone
                          ? "bg-[#d4901e]/20"
                          : isActive
                          ? "bg-[#d4901e] text-[#111111]"
                          : "bg-white/[0.08] text-white/40"
                      }`}
                    >
                      {isDone ? (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#d4901e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <span>{n}</span>
                      )}
                    </div>

                    {/* Title */}
                    <span
                      className={`text-[13px] font-semibold flex-1 min-w-0 ${
                        isDone ? "text-white/40" : isActive ? "text-[#faf9f7]" : "text-white/45"
                      }`}
                    >
                      {title}
                    </span>

                    {/* Summary (collapsed / done) */}
                    {!isActive && (
                      <span className="ml-auto text-[11px] text-white/25 truncate max-w-[100px]">
                        {getSummary(n)}
                      </span>
                    )}

                    {/* Chevron / done check */}
                    {isDone ? (
                      <svg className="flex-shrink-0 text-[#d4901e] ml-1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    ) : (
                      <ChevronIcon open={isActive} />
                    )}
                  </button>

                  {/* Section body */}
                  {isActive && (
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      className="px-5 pb-5 space-y-3.5"
                    >
              <SectionContent
                n={n}
                data={data}
                errors={errors}
                currentKind={currentKind}
                logoError={logoError}
                customerOptions={matchingCustomerOptions}
                update={update}
                updateLineItem={updateLineItem}
                addLineItem={addLineItem}
                removeLineItem={removeLineItem}
                updateAdditionalFee={updateAdditionalFee}
                addAdditionalFee={addAdditionalFee}
                removeAdditionalFee={removeAdditionalFee}
                setSelectedCustomerId={setSelectedCustomerId}
                setSelectedWorkspaceCustomer={setSelectedWorkspaceCustomer}
                setLogoError={setLogoError}
                onToggleApplyTax={toggleApplyTax}
              />

                      {/* Next button */}
                      <button
                        type="button"
                        onClick={() => markDone(n)}
                        className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all bg-[#d4901e] text-[#111111] hover:brightness-110 shadow-[0_4px_14px_rgba(212,144,30,0.25)]"
                      >
                        {n === TOTAL_SECTIONS
                          ? "Done — Download PDF"
                          : (
                            <>
                              Next
                              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                              </svg>
                            </>
                          )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: preview + template strip */}
        <div className="grid grid-cols-[1fr_180px] min-h-0 overflow-hidden">
          {/* Preview main */}
          <div className="flex flex-col p-5 pl-7 min-h-0 overflow-hidden bg-[#0d0d0d]">
            <div className="no-print mb-3 flex flex-shrink-0 flex-wrap items-center gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
                Live Preview
              </p>
              <span className="rounded-full border border-[#d4901e]/25 bg-[#d4901e]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#d4901e]">
                Selected template: {selectedTemplateDefinition?.label ?? "Minimal"}
              </span>
            </div>
            <div className="print-host flex-1 min-h-0 overflow-auto rounded-lg border border-white/[0.07] bg-[#1a1a1a] p-4">
              <div
                data-testid="preview-frame"
                data-template-id={data.templateId}
                className="mx-auto w-full max-w-[900px]"
              >
                <div
                  ref={previewRef}
                  data-testid="preview-export-root"
                  className="print-stack"
                >
                  <PreviewPanel data={data} />
                </div>
              </div>
            </div>
          </div>

          {/* Template & colour panel */}
          <div className="border-l border-white/[0.07] bg-[#111111] flex flex-col gap-5 py-5 px-4 overflow-y-auto no-print w-[180px] shrink-0">

            {/* Template picker */}
            <div className="flex flex-col gap-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/25 text-center">
                Template
              </p>
              {templates.map((template) => {
                const isSelected = data.templateId === template.id;
                const activeTheme = THEMES.find((t) => t.id === data.themeId) ?? THEMES[0];
                return (
                  <div
                    key={template.id}
                    className="rounded-xl overflow-hidden"
                    style={{
                      boxShadow: isSelected
                        ? `0 0 0 2.5px ${activeTheme.accent}, 0 4px 14px rgba(0,0,0,0.13)`
                        : "0 0 0 1.5px #dedad6, 0 2px 6px rgba(0,0,0,0.05)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setData((prev) => ({ ...prev, templateId: template.id }))}
                      aria-label={`${template.label} template`}
                      aria-pressed={isSelected}
                      className="cursor-pointer transition-all w-full focus:outline-none"
                    >
                      {/* Mini document preview */}
                      {template.thumbnailVariant === "dark" ? (
                        <div
                          className="relative overflow-hidden"
                          style={{ aspectRatio: "4/2.6", background: activeTheme.gradient }}
                        >
                          <div style={{ position: "absolute", top: -16, right: -16, width: 72, height: 72, background: activeTheme.glow }} />
                          <div className="absolute top-2.5 left-2.5 right-2.5">
                            <div className="h-[5px] rounded-sm bg-white/80 w-1/2 mb-1" />
                            <div className="h-[3px] rounded-sm bg-white/35 w-1/3" />
                          </div>
                          <div className="absolute bottom-1.5 left-2.5 right-2.5 space-y-[3px]">
                            <div className="h-[2px] rounded-sm bg-white/25 w-full" />
                            <div className="h-[2px] rounded-sm bg-white/18 w-3/4" />
                          </div>
                        </div>
                      ) : template.thumbnailVariant === "bold" ? (
                        <div
                          className="relative overflow-hidden bg-white"
                          style={{ aspectRatio: "4/2.6" }}
                        >
                          {/* Top-right corner cut */}
                          <svg style={{ position: "absolute", top: 0, right: 0, width: 36, height: 36 }} viewBox="0 0 36 36" fill="none">
                            <polygon points="36,0 36,36 0,0" fill={activeTheme.accent} opacity="0.18" />
                            <polygon points="36,0 36,20 16,0" fill={activeTheme.accent} opacity="0.55" />
                            <polygon points="36,0 36,10 26,0" fill={activeTheme.accent} />
                          </svg>
                          {/* Bottom-left corner cut */}
                          <svg style={{ position: "absolute", bottom: 0, left: 0, width: 30, height: 30 }} viewBox="0 0 30 30" fill="none">
                            <polygon points="0,30 30,30 0,0" fill={activeTheme.accent} opacity="0.18" />
                            <polygon points="0,30 16,30 0,14" fill={activeTheme.accent} opacity="0.55" />
                            <polygon points="0,30 8,30 0,22" fill={activeTheme.accent} />
                          </svg>
                          {/* Centered title */}
                          <div className="absolute top-[6px] left-0 right-0 flex justify-center">
                            <div className="h-[5px] rounded-sm w-1/4 bg-[#1a1a1a]" />
                          </div>
                          {/* Bill to left, doc# right */}
                          <div className="absolute top-[15px] left-2.5 right-2.5 flex justify-between">
                            <div className="flex flex-col gap-[2px]">
                              <div className="h-[3px] rounded-sm w-[24px] bg-[#ccc]" />
                              <div className="h-[4px] rounded-sm w-[32px] bg-[#222]" />
                            </div>
                            <div className="flex flex-col gap-[2px] items-end">
                              <div className="h-[3px] rounded-sm w-[18px] bg-[#ccc]" />
                              <div className="h-[4px] rounded-sm w-[28px] bg-[#222]" />
                            </div>
                          </div>
                          {/* Bordered table rows */}
                          <div className="absolute top-[30px] left-2.5 right-2.5 space-y-[2px]">
                            <div className="h-[5px] rounded-sm bg-[#f5f5f5]" style={{ borderBottom: `1px solid ${activeTheme.accent}` }} />
                            <div className="h-[4px] rounded-sm bg-white border border-[#ddd]" />
                            <div className="h-[4px] rounded-sm bg-white border border-[#ddd]" />
                            <div className="h-[4px] rounded-sm bg-white border border-[#ddd]" />
                          </div>
                          {/* Totals box bottom-right */}
                          <div className="absolute bottom-[10px] right-2.5 w-[40%]">
                            <div className="h-[5px] rounded-sm w-full" style={{ background: activeTheme.accent }} />
                          </div>
                        </div>
                      ) : template.thumbnailVariant === "classic" ? (
                        <div
                          className="relative overflow-hidden bg-white"
                          style={{ aspectRatio: "4/2.6" }}
                        >
                          <div className="absolute top-[5px] left-0 right-0 flex justify-center">
                            <div className="h-[5px] rounded-sm w-1/3" style={{ background: activeTheme.accent }} />
                          </div>
                          <div className="absolute top-[14px] left-2.5 right-2.5 flex justify-between items-start">
                            <div className="h-[4px] rounded-sm w-1/3" style={{ background: "#222" }} />
                            <div className="flex flex-col gap-[2px] items-end">
                              <div className="h-[3px] rounded-sm w-[20px] bg-[#ccc]" />
                              <div className="h-[3px] rounded-sm w-[14px] bg-[#ccc]" />
                            </div>
                          </div>
                          <div className="absolute top-[23px] left-2.5 right-2.5 flex gap-1.5">
                            <div className="flex-1 h-[16px] rounded-sm" style={{ background: activeTheme.accent, opacity: 0.1 }} />
                            <div className="flex-1 h-[16px] rounded-sm" style={{ background: activeTheme.accent, opacity: 0.1 }} />
                          </div>
                          <div className="absolute top-[44px] left-2.5 right-2.5 h-[6px] rounded-sm" style={{ background: activeTheme.accent }} />
                          <div className="absolute top-[53px] left-2.5 right-2.5 space-y-[3px]">
                            <div className="h-[3px] rounded-sm bg-[#f0ede9] w-full" />
                            <div className="h-[3px] rounded-sm w-full" style={{ background: activeTheme.accent, opacity: 0.07 }} />
                            <div className="h-[3px] rounded-sm bg-[#f0ede9] w-full" />
                          </div>
                        </div>
                      ) : (
                        <div
                          className="relative overflow-hidden bg-white"
                          style={{ aspectRatio: "4/2.6" }}
                        >
                          <div className="absolute top-0 left-0 right-0 h-[4px]" style={{ background: activeTheme.accent }} />
                          <div className="absolute top-[8px] left-2.5 right-2.5 flex justify-between items-start">
                            <div className="h-[5px] rounded-sm w-2/5" style={{ background: "#222" }} />
                            <div className="h-[5px] rounded-full w-[22px]" style={{ background: activeTheme.accent }} />
                          </div>
                          <div className="absolute top-[18px] left-0 right-0 h-[14px]" style={{ background: "#f5f3f0", borderTop: "1px solid #ede9e4", borderBottom: "1px solid #ede9e4" }} />
                          <div className="absolute top-[36px] left-2.5 flex gap-2">
                            <div className="w-[2px] h-[12px] rounded-full" style={{ background: activeTheme.accent }} />
                            <div className="flex flex-col gap-[2px]">
                              <div className="h-[3px] rounded-sm bg-[#222] w-[28px]" />
                              <div className="h-[2px] rounded-sm bg-[#ccc] w-[20px]" />
                            </div>
                          </div>
                          <div className="absolute bottom-[12px] left-2.5 right-2.5 space-y-[3px]">
                            <div className="h-[2px] rounded-sm w-full" style={{ background: activeTheme.accent, opacity: 0.3 }} />
                            <div className="h-[2px] rounded-sm bg-[#e5e0db] w-5/6" />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: activeTheme.accent }} />
                        </div>
                      )}
                      <div className="bg-[#1a1a1a] px-2 py-[7px] flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-[#faf9f7]">{template.label}</span>
                        {isSelected && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <circle cx="5" cy="5" r="5" fill={activeTheme.accent} />
                            <path d="M2.5 5l1.8 1.8L7.5 3.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </button>
                    {isSelected ? (
                      <TemplateColorPicker
                        templateId={template.id}
                        selectedThemeId={data.themeId}
                        onSelectTheme={(themeId) => setData((prev) => ({ ...prev, themeId }))}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* AdSense placeholder */}
            <div className="mt-auto bg-white/[0.03] border border-dashed border-white/[0.08] rounded-xl min-h-[80px] flex items-center justify-center text-[9px] uppercase tracking-widest text-white/20">
              Ad
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── section content ──────────────────────────────────────────────────────────

type SectionContentProps = {
  n: number;
  data: DocumentData;
  errors: FieldErrors;
  currentKind: DocumentKind;
  logoError: string | null;
  customerOptions: CustomerOption[];
  update: <K extends keyof DocumentData>(key: K, value: DocumentData[K]) => void;
  updateLineItem: (index: number, key: keyof LineItem, value: LineItem[keyof LineItem]) => void;
  addLineItem: () => void;
  removeLineItem: (index: number) => void;
  updateAdditionalFee: (
    index: number,
    key: keyof AdditionalFee,
    value: AdditionalFee[keyof AdditionalFee],
  ) => void;
  addAdditionalFee: () => void;
  removeAdditionalFee: (index: number) => void;
  setSelectedCustomerId: (value: string | null) => void;
  setSelectedWorkspaceCustomer: (value: SelectedWorkspaceCustomer | null) => void;
  setLogoError: (v: string | null) => void;
  onToggleApplyTax: (value: boolean) => void;
};

function SectionContent({
  n,
  data,
  errors,
  currentKind,
  logoError,
  customerOptions,
  update,
  updateLineItem,
  addLineItem,
  removeLineItem,
  updateAdditionalFee,
  addAdditionalFee,
  removeAdditionalFee,
  setSelectedCustomerId,
  setSelectedWorkspaceCustomer,
  setLogoError,
  onToggleApplyTax,
}: SectionContentProps) {
  const showLineItems = currentKind !== "receipt";
  const paymentTermSummary = getPaymentTermSummary(data);

  // ── Section 1: Your business ───────────────────────────────────────────────
  if (n === 1) {
    return (
      <div className="space-y-3">
        <label className="block">
          <span className={labelClass}>Business name</span>
          <input
            aria-label="Business name"
            className={inputClass}
            value={data.businessName}
            onChange={(e) => update("businessName", e.target.value)}
          />
          <FieldError msg={errors.businessName} />
        </label>
        <label className="block">
          <span className={labelClass}>Business address</span>
          <textarea
            aria-label="Business address"
            rows={3}
            className={`${inputClass} resize-none`}
            value={data.businessAddress}
            onChange={(e) => update("businessAddress", e.target.value)}
          />
        </label>
        <div className="pt-1">
          <span className={labelClass}>Logo</span>
          <LogoUpload
            value={data.logoDataUrl}
            error={logoError}
            onChange={(value) => update("logoDataUrl", value)}
            onErrorChange={setLogoError}
          />
        </div>
      </div>
    );
  }

  // ── Section 2: Client ──────────────────────────────────────────────────────
  if (n === 2) {
    return (
      <div className="space-y-3">
        <label className="block">
          <span className={labelClass}>Customer name</span>
          <input
            aria-label="Customer name"
            className={inputClass}
            value={data.customerName}
            onChange={(e) => update("customerName", e.target.value)}
          />
          <FieldError msg={errors.customerName} />
        </label>
        <CustomerAutosuggest
          query={data.customerName}
          options={customerOptions}
          onPick={(option) => {
            const selectedCustomer = {
              id: option.id,
              name: option.name,
              address: option.address,
              selectedAt: new Date().toISOString(),
            };
            setSelectedCustomerId(option.id);
            setSelectedWorkspaceCustomer(selectedCustomer);
            update("customerName", option.name);
            update("customerAddress", option.address);
          }}
        />
        <label className="block">
          <span className={labelClass}>Customer address</span>
          <textarea
            aria-label="Customer address"
            rows={3}
            className={`${inputClass} resize-none`}
            value={data.customerAddress}
            onChange={(e) => update("customerAddress", e.target.value)}
          />
        </label>
      </div>
    );
  }

  // ── Section 3: Document details ────────────────────────────────────────────
  if (n === 3) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={labelClass}>Document number</span>
            <input
              aria-label="Document number"
              className={inputClass}
              value={data.documentNumber}
              onChange={(e) => update("documentNumber", e.target.value)}
            />
            <FieldError msg={errors.documentNumber} />
          </label>
          <label className="block">
            <span className={labelClass}>Document date</span>
            <input
              aria-label="Document date"
              type="text"
              inputMode="numeric"
              placeholder="YYYY-MM-DD"
              className={inputClass}
              value={data.documentDate}
              onChange={(e) => update("documentDate", e.target.value)}
            />
            <FieldError msg={errors.documentDate} />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={labelClass}>Valid until</span>
            <input
              aria-label="Valid until"
              type="text"
              inputMode="numeric"
              placeholder="YYYY-MM-DD"
              className={inputClass}
              value={data.validUntil}
              onChange={(e) => update("validUntil", e.target.value)}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Payment term preset</span>
            <PaymentTermPresetDropdown
              value={data.paymentTermPreset}
              onSelect={(preset) => {
                const presetPercentage = getPresetPercentage(preset);

                update("paymentTermPreset", preset);
                update(
                  "paymentTermPercentage",
                  preset === "custom"
                    ? data.paymentTermPercentage ?? 50
                    : presetPercentage,
                );
                if (preset !== "custom") {
                  update("paymentTermLabel", "");
                }
              }}
            />
          </label>
        </div>
        {showLineItems && data.paymentTermPreset === "custom" ? (
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={labelClass}>Custom payment percentage</span>
              <input
                aria-label="Custom payment percentage"
                type="number"
                min="0.01"
                max="100"
                step="0.01"
                className={inputClass}
                value={String(data.paymentTermPercentage ?? "")}
                onChange={(e) => update("paymentTermPercentage", getNumericValue(e.target.value))}
              />
              <FieldError msg={errors.paymentTermPercentage} />
            </label>
            <label className="block">
              <span className={labelClass}>Custom payment label</span>
              <input
                aria-label="Custom payment label"
                className={inputClass}
                placeholder="e.g. Progress payment"
                value={data.paymentTermLabel}
                onChange={(e) => update("paymentTermLabel", e.target.value)}
              />
            </label>
          </div>
        ) : null}
        {showLineItems && paymentTermSummary ? (
          <p className="text-xs text-white/55">
            Amount due now: {formatCurrency(paymentTermSummary.amountDue, data.currency)}
          </p>
        ) : null}
        <label className="block">
          <span className={labelClass}>Currency</span>
          <input
            aria-label="Currency"
            className={inputClass}
            value={data.currency}
            onChange={(e) => update("currency", e.target.value.toUpperCase())}
          />
          <FieldError msg={errors.currency} />
        </label>

        {showLineItems ? (
          <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
            <button
              type="button"
              role="switch"
              aria-checked={data.applyTax}
              aria-label="Apply tax"
              onClick={() => onToggleApplyTax(!data.applyTax)}
              className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition ${
                data.applyTax
                  ? "border-[#d4901e]/40 bg-[#d4901e]/10 text-[#faf9f7]"
                  : "border-white/10 bg-white/[0.03] text-white/55"
              }`}
            >
              <span>Apply tax</span>
              <span
                className={`h-5 w-10 rounded-full p-0.5 transition ${
                  data.applyTax ? "bg-[#d4901e]" : "bg-white/15"
                }`}
              >
                <span
                  className={`block h-4 w-4 rounded-full bg-[#111111] transition ${
                    data.applyTax ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </span>
            </button>
            {data.applyTax ? (
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className={labelClass}>Tax label</span>
                  <input
                    aria-label="Tax label"
                    className={inputClass}
                    value={data.taxLabel}
                    onChange={(e) => update("taxLabel", e.target.value)}
                  />
                  <FieldError msg={errors.taxLabel} />
                </label>
                <label className="block">
                  <span className={labelClass}>Tax rate (%)</span>
                  <input
                    aria-label="Tax rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    className={inputClass}
                    value={String(data.taxRate)}
                    onChange={(e) => update("taxRate", getNumericValue(e.target.value))}
                  />
                  <FieldError msg={errors.taxRate} />
                </label>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={labelClass}>Payment method</span>
              <input
                aria-label="Payment method"
                className={inputClass}
                value={data.paymentMethod}
                onChange={(e) => update("paymentMethod", e.target.value)}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Amount received</span>
              <input
                aria-label="Amount received"
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={String(data.amountReceived)}
                onChange={(e) => update("amountReceived", getNumericValue(e.target.value))}
              />
              <FieldError msg={errors.amountReceived} />
            </label>
          </div>
        )}
      </div>
    );
  }

  // ── Section 4: Line items (invoice/quotation only) ─────────────────────────
  if (n === 4) {
    return (
      <div className="space-y-3">
        {data.lineItems.map((item, index) => (
          <div
            key={item.id}
            data-testid={`line-item-card-${index}`}
            data-line-item-id={item.id}
            className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-3 space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-white/35">
                Item {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeLineItem(index)}
                disabled={data.lineItems.length === 1}
                data-testid={`line-item-actions-${index}`}
                className="text-[11px] text-white/35 hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Remove
              </button>
            </div>
            <label className="block">
              <span className={labelClass}>Description</span>
              <input
                aria-label={`Line item ${index + 1} description`}
                className={inputClass}
                value={item.description}
                onChange={(e) => updateLineItem(index, "description", e.target.value)}
              />
              <FieldError msg={errors[`lineItems.${index}.description`]} />
            </label>
            <label className="block">
              <span className={labelClass}>Note</span>
              <textarea
                aria-label={`Line item ${index + 1} note`}
                rows={2}
                className={`${inputClass} resize-none`}
                value={item.note}
                onChange={(e) => updateLineItem(index, "note", e.target.value)}
              />
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <label className="block">
                <span className={labelClass}>Qty</span>
                <input
                  aria-label={`Line item ${index + 1} quantity`}
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClass}
                  value={String(item.quantity)}
                  onChange={(e) => updateLineItem(index, "quantity", getNumericValue(e.target.value))}
                />
                <FieldError msg={errors[`lineItems.${index}.quantity`]} />
              </label>
              <label className="block">
                <span className={labelClass}>Unit</span>
                <LineItemUnitDropdown
                  ariaLabel={`Line item ${index + 1} unit`}
                  value={item.unit}
                  onSelect={(value) => updateLineItem(index, "unit", value)}
                />
                <FieldError msg={errors[`lineItems.${index}.unit`]} />
              </label>
              <label className="block">
                <span className={labelClass}>Unit price</span>
                <input
                  aria-label={`Line item ${index + 1} unit price`}
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClass}
                  value={String(item.unitPrice)}
                  onChange={(e) => updateLineItem(index, "unitPrice", getNumericValue(e.target.value))}
                />
                <FieldError msg={errors[`lineItems.${index}.unitPrice`]} />
              </label>
            </div>
            {item.unit === "custom" ? (
              <label className="block">
                <span className={labelClass}>Custom unit</span>
                <input
                  aria-label={`Line item ${index + 1} custom unit`}
                  className={inputClass}
                  value={item.customUnit}
                  onChange={(e) => updateLineItem(index, "customUnit", e.target.value)}
                />
                <FieldError msg={errors[`lineItems.${index}.customUnit`]} />
              </label>
            ) : null}
          </div>
        ))}

        {errors.lineItems && (
          <p className="text-xs text-red-600">{errors.lineItems}</p>
        )}

        <button
          type="button"
          onClick={addLineItem}
          className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/15 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white/40 hover:border-[#d4901e]/40 hover:text-[#d4901e] transition-all"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add line item
        </button>

        <div className="space-y-3 rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-white/35">
              Additional fees
            </span>
            <button
              type="button"
              onClick={addAdditionalFee}
              className="rounded-lg border border-dashed border-white/15 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/45 transition-all hover:border-[#d4901e]/40 hover:text-[#d4901e]"
            >
              Add fee
            </button>
          </div>

          {data.additionalFees.length ? (
            <div className="space-y-2.5">
              {data.additionalFees.map((fee, index) => (
                <div
                  key={fee.id}
                  className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-3"
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_120px_auto] gap-2.5">
                    <label className="block">
                      <span className={labelClass}>Fee label</span>
                      <input
                        aria-label={`Fee ${index + 1} label`}
                        className={inputClass}
                        placeholder="Transport"
                        value={fee.label}
                        onChange={(e) => updateAdditionalFee(index, "label", e.target.value)}
                      />
                      <FieldError msg={errors[`additionalFees.${index}.label`]} />
                    </label>
                    <label className="block">
                      <span className={labelClass}>Amount</span>
                      <input
                        aria-label={`Fee ${index + 1} amount`}
                        type="number"
                        min="0"
                        step="0.01"
                        className={inputClass}
                        value={String(fee.amount)}
                        onChange={(e) =>
                          updateAdditionalFee(index, "amount", getNumericValue(e.target.value))
                        }
                      />
                      <FieldError msg={errors[`additionalFees.${index}.amount`]} />
                    </label>
                    <div className="flex items-end">
                      <button
                        type="button"
                        aria-label={`Remove fee ${index + 1}`}
                        onClick={() => removeAdditionalFee(index)}
                        className="w-full rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white/45 transition-colors hover:border-red-400/40 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // ── Section 5: Notes ───────────────────────────────────────────────────────
  if (n === 5) {
    return (
      <div className="space-y-3">
        <label className="block">
          <span className={labelClass}>Notes</span>
          <textarea
            aria-label="Notes"
            rows={5}
            className={`${inputClass} resize-none`}
            value={data.notes}
            placeholder="Payment terms, thank you message, etc."
            onChange={(e) => update("notes", e.target.value)}
          />
        </label>
      </div>
    );
  }

  return null;
}
