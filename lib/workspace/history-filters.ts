import type { SavedDocumentRecord } from "./types";

export type HistoryDateFilter =
  | { mode: "all" }
  | { mode: "last7" }
  | { mode: "last30" }
  | { mode: "thisMonth" }
  | { mode: "custom"; startDate: string; endDate: string };

export type HistoryCustomerFilter =
  | { mode: "all" }
  | { mode: "customer"; customerId: string }
  | { mode: "none" };

function parseIssueDate(value: string) {
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function matchesDateFilter(document: SavedDocumentRecord, filter: HistoryDateFilter, now: Date) {
  if (filter.mode === "all") {
    return true;
  }

  const issueDate = parseIssueDate(document.issueDate);
  if (!issueDate) {
    return false;
  }

  const currentDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (filter.mode === "last7") {
    const start = new Date(currentDay);
    start.setDate(start.getDate() - 6);
    return issueDate >= start && issueDate <= endOfDay(currentDay);
  }

  if (filter.mode === "last30") {
    const start = new Date(currentDay);
    start.setDate(start.getDate() - 29);
    return issueDate >= start && issueDate <= endOfDay(currentDay);
  }

  if (filter.mode === "thisMonth") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    return issueDate >= start && issueDate <= end;
  }

  const start = filter.startDate ? parseIssueDate(filter.startDate) : null;
  const end = filter.endDate ? parseIssueDate(filter.endDate) : null;

  if (start && end && start > end) {
    return false;
  }

  if (start && issueDate < start) {
    return false;
  }

  if (end && issueDate > endOfDay(end)) {
    return false;
  }

  return true;
}

function matchesCustomerFilter(document: SavedDocumentRecord, filter: HistoryCustomerFilter) {
  if (filter.mode === "all") {
    return true;
  }

  if (filter.mode === "none") {
    return document.customerId === null;
  }

  return document.customerId === filter.customerId;
}

export function filterHistoryDocuments({
  documents,
  dateFilter,
  customerFilter,
  now = new Date(),
}: {
  documents: SavedDocumentRecord[];
  dateFilter: HistoryDateFilter;
  customerFilter: HistoryCustomerFilter;
  now?: Date;
}) {
  return documents.filter(
    (document) =>
      matchesDateFilter(document, dateFilter, now) &&
      matchesCustomerFilter(document, customerFilter),
  );
}

export function getHistoryCustomerLabel(customerId: string | null, customerNameById: Map<string, string>) {
  if (customerId === null) {
    return "No customer";
  }

  return customerNameById.get(customerId) ?? "Unknown customer";
}

export function hasInvalidCustomRange(filter: HistoryDateFilter) {
  if (filter.mode !== "custom") {
    return false;
  }

  const start = filter.startDate ? parseIssueDate(filter.startDate) : null;
  const end = filter.endDate ? parseIssueDate(filter.endDate) : null;
  return Boolean(start && end && start > end);
}
