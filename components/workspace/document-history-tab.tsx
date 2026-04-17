import React from "react";
import type { DocumentKind } from "../../lib/documents/types";
import type { CustomerRecord, SavedDocumentRecord } from "../../lib/workspace/types";
import {
  filterHistoryDocuments,
  getHistoryCustomerLabel,
  hasInvalidCustomRange,
  type HistoryCustomerFilter,
  type HistoryDateFilter,
} from "../../lib/workspace/history-filters";
import { ThemedDropdown } from "./themed-dropdown";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white placeholder:text-white/25 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus:border-[#d4901e]/50 focus:outline-none";

const DATE_RANGE_OPTIONS: Array<{ value: HistoryDateFilter["mode"]; label: string }> = [
  { value: "all", label: "All dates" },
  { value: "last7", label: "Last 7 days" },
  { value: "last30", label: "Last 30 days" },
  { value: "thisMonth", label: "This month" },
  { value: "custom", label: "Custom range" },
];

export function DocumentHistoryTab({
  documents,
  customers,
  kind,
  now = new Date(),
}: {
  documents: SavedDocumentRecord[];
  customers: CustomerRecord[];
  kind: DocumentKind;
  now?: Date;
}) {
  const [dateFilter, setDateFilter] = React.useState<HistoryDateFilter>({ mode: "all" });
  const [customerSearch, setCustomerSearch] = React.useState("");
  const [customerFilter, setCustomerFilter] = React.useState<HistoryCustomerFilter>({ mode: "all" });

  const customerNameById = React.useMemo(
    () => new Map(customers.map((customer) => [customer.id, customer.name])),
    [customers],
  );

  const customerOptions = React.useMemo(() => {
    const query = customerSearch.trim().toLowerCase();
    const options = [
      { id: "__all__", label: "All customers", filter: { mode: "all" } as const },
      { id: "__none__", label: "No customer", filter: { mode: "none" } as const },
      ...customers.map((customer) => ({
        id: customer.id,
        label: customer.name,
        filter: { mode: "customer", customerId: customer.id } as const,
      })),
    ];

    if (!query) {
      return options;
    }

    return options.filter((option) => option.label.toLowerCase().includes(query));
  }, [customerSearch, customers]);

  const filteredDocuments = React.useMemo(
    () =>
      filterHistoryDocuments({
        documents,
        dateFilter,
        customerFilter,
        now,
      }),
    [customerFilter, dateFilter, documents, now],
  );

  const invalidRange = hasInvalidCustomRange(dateFilter);
  const hasActiveFilters =
    dateFilter.mode !== "all" || customerFilter.mode !== "all" || customerSearch.trim().length > 0;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[#faf9f7]">Document History</h2>
        <p className="mt-1 text-sm text-white/40">Browse and filter saved documents for this business.</p>
      </div>

      <div className="mb-6 grid gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 md:grid-cols-[220px_minmax(0,1fr)_auto]">
        <label className="text-sm text-white/75">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-white/35">Date range</span>
          <ThemedDropdown
            ariaLabel="Date range"
            value={dateFilter.mode}
            options={DATE_RANGE_OPTIONS}
            buttonClassName={inputClass}
            onSelect={(mode) => {
              if (mode === "custom") {
                setDateFilter({ mode: "custom", startDate: "", endDate: "" });
                return;
              }

              if (mode === "last7" || mode === "last30" || mode === "thisMonth" || mode === "all") {
                setDateFilter({ mode });
              }
            }}
          />
        </label>

        <div>
          <label className="text-sm text-white/75">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-white/35">Customer filter</span>
            <input
              aria-label="Customer filter"
              value={customerSearch}
              onChange={(event) => setCustomerSearch(event.target.value)}
              placeholder="Search customers"
              className={inputClass}
            />
          </label>
          <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-white/10 bg-[#111111] p-2">
            {customerOptions.length === 0 ? (
              <p className="px-2 py-1 text-sm text-white/35">No matching customers</p>
            ) : (
              customerOptions.map((option) => {
                const isSelected =
                  (option.filter.mode === "all" && customerFilter.mode === "all") ||
                  (option.filter.mode === "none" && customerFilter.mode === "none") ||
                  (option.filter.mode === "customer" &&
                    customerFilter.mode === "customer" &&
                    option.filter.customerId === customerFilter.customerId);

                return (
                <button
                  key={option.id}
                  role="option"
                  aria-selected={isSelected}
                  type="button"
                  onClick={() => {
                    setCustomerFilter(option.filter);
                    setCustomerSearch(option.label);
                  }}
                  className="block w-full rounded-lg px-2 py-1 text-left text-sm text-white/75 transition hover:bg-white/5 hover:text-white"
                >
                  {option.label}
                </button>
                );
              })
            )}
          </div>
        </div>

        {hasActiveFilters ? (
          <div className="flex items-start md:justify-end">
            <button
              type="button"
              onClick={() => {
                setDateFilter({ mode: "all" });
                setCustomerFilter({ mode: "all" });
                setCustomerSearch("");
              }}
              className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-white/75 transition hover:border-white/20 hover:text-white"
            >
              Clear filters
            </button>
          </div>
        ) : null}
      </div>

      {dateFilter.mode === "custom" ? (
        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-white/75">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-white/35">Start date</span>
            <input
              aria-label="Start date"
              type="text"
              inputMode="numeric"
              placeholder="YYYY-MM-DD"
              value={dateFilter.startDate}
              onChange={(event) =>
                setDateFilter((current) =>
                  current.mode === "custom"
                    ? { ...current, startDate: event.target.value }
                    : current,
                )
              }
              className={inputClass}
            />
          </label>
          <label className="text-sm text-white/75">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-white/35">End date</span>
            <input
              aria-label="End date"
              type="text"
              inputMode="numeric"
              placeholder="YYYY-MM-DD"
              value={dateFilter.endDate}
              onChange={(event) =>
                setDateFilter((current) =>
                  current.mode === "custom"
                    ? { ...current, endDate: event.target.value }
                    : current,
                )
              }
              className={inputClass}
            />
          </label>
        </div>
      ) : null}

      {invalidRange ? (
        <p className="mb-4 text-sm text-[#f59e0b]">Start date must be on or before end date.</p>
      ) : null}

      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.02] py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05]">
            <svg
              className="h-6 w-6 text-white/25"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-white/40">No documents yet</p>
          <p className="mt-1 text-xs text-white/25">Documents you save will appear here.</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.02] py-16 text-center">
          <p className="text-sm font-medium text-white/40">No documents match these filters</p>
          <p className="mt-1 text-xs text-white/25">Try a different date range or customer, or clear filters to see everything again.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDocuments.map((doc) => (
            <a
              key={doc.id}
              href={`/workspace/${doc.kind}?tab=documents`}
              className="flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 transition-all hover:border-[#d4901e]/25 hover:bg-[#d4901e]/[0.06]"
            >
              <div>
                <div className="text-sm font-semibold text-[#faf9f7]">
                  {doc.documentNumber || "Untitled"}
                </div>
                <div className="mt-0.5 text-xs text-white/40">
                  {doc.kind} - {doc.issueDate} -{" "}
                  <span>{getHistoryCustomerLabel(doc.customerId, customerNameById)}</span>
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${
                  doc.status === "exported"
                    ? "border border-[#16a34a]/30 bg-[#16a34a]/10 text-[#4ade80]"
                    : "border border-white/10 bg-white/[0.05] text-white/40"
                }`}
              >
                {doc.status}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
