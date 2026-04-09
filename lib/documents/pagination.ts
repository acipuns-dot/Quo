import type { DocumentData, PaginatedDocument, PaginatedDocumentPage } from "./types";
import { getRenderableLineItems } from "./line-items";

type CapacityProfile = {
  firstPage: number;
  continuationPage: number;
  finalPageReserve: number;
  rowWeight: number;
  notedRowWeight: number;
  notesReserve: number;
  paymentTermsReserve: number;
};

const COMFORTABLE: CapacityProfile = {
  firstPage: 15,
  continuationPage: 20,
  finalPageReserve: 4,
  rowWeight: 1,
  notedRowWeight: 1.6,
  notesReserve: 1.5,
  paymentTermsReserve: 4.3,
};

const COMPACT: CapacityProfile = {
  firstPage: 20,
  continuationPage: 25,
  finalPageReserve: 5.5,
  rowWeight: 1,
  notedRowWeight: 1.45,
  notesReserve: 1.25,
  paymentTermsReserve: 3.5,
};

const MODERN_INVOICE_COMFORTABLE: CapacityProfile = {
  ...COMFORTABLE,
  finalPageReserve: 4.5,
};

const MODERN_INVOICE_COMPACT: CapacityProfile = {
  ...COMPACT,
  finalPageReserve: 7.5,
  paymentTermsReserve: 0,
};

const EDGE_INVOICE_COMFORTABLE: CapacityProfile = {
  ...COMFORTABLE,
  finalPageReserve: 5.5,
};

const EDGE_INVOICE_COMPACT: CapacityProfile = {
  ...COMPACT,
  finalPageReserve: 8.2,
  paymentTermsReserve: 0,
};

const CLASSIC_INVOICE_COMFORTABLE: CapacityProfile = {
  ...COMFORTABLE,
  finalPageReserve: 5.5,
};

const CLASSIC_INVOICE_COMPACT: CapacityProfile = {
  ...COMPACT,
  finalPageReserve: 8.2,
  paymentTermsReserve: 0,
};

const BOLD_INVOICE_COMFORTABLE: CapacityProfile = {
  ...COMFORTABLE,
  finalPageReserve: 7,
};

const BOLD_INVOICE_COMPACT: CapacityProfile = {
  ...COMPACT,
  finalPageReserve: 7.5,
  paymentTermsReserve: 0,
};

function getCapacityProfiles(data: DocumentData) {
  if (data.kind === "invoice") {
    switch (data.templateId) {
      case "default":
        return {
          comfortable: MODERN_INVOICE_COMFORTABLE,
          compact: MODERN_INVOICE_COMPACT,
        };
      case "edge":
        return {
          comfortable: EDGE_INVOICE_COMFORTABLE,
          compact: EDGE_INVOICE_COMPACT,
        };
      case "classic":
        return {
          comfortable: CLASSIC_INVOICE_COMFORTABLE,
          compact: CLASSIC_INVOICE_COMPACT,
        };
      case "bold":
        return {
          comfortable: BOLD_INVOICE_COMFORTABLE,
          compact: BOLD_INVOICE_COMPACT,
        };
      default:
        break;
    }
  }

  return {
    comfortable: COMFORTABLE,
    compact: COMPACT,
  };
}

function getRowWeight(note: string, profile: CapacityProfile) {
  return note.trim() ? profile.notedRowWeight : profile.rowWeight;
}

function getVerboseContentWeight(
  kind: DocumentData["kind"],
  description: string,
  note: string,
) {
  if (kind !== "invoice") {
    return 0;
  }

  const combinedLength = `${description.trim()} ${note.trim()}`.trim().length;

  if (combinedLength > 48) {
    return 0.8;
  }

  if (combinedLength > 32) {
    return 0.4;
  }

  return 0;
}

function hasPaymentTerms(data: DocumentData) {
  return (
    data.kind === "invoice" &&
    !!data.paymentTermPreset &&
    data.paymentTermPercentage !== null &&
    data.paymentTermPercentage > 0
  );
}

function notesLineCount(notes: string): number {
  if (!notes.trim()) return 0;
  // Count content lines + 1 for the "Notes" label (auto-generated notice is covered by finalPageReserve)
  const contentLines = notes.split("\n").length;
  return contentLines + 1;
}

function reserveTrailingContent(data: DocumentData, profile: CapacityProfile) {
  // Each notes line ≈ 0.55 row-units; minimum 1.5 when notes present to cover label + notice
  const lineCount = notesLineCount(data.notes);
  const noteReserve = lineCount > 0 ? Math.max(profile.notesReserve, lineCount * 0.44) : 0;
  const paymentTermReserve = hasPaymentTerms(data) ? profile.paymentTermsReserve : 0;
  return profile.finalPageReserve + noteReserve + paymentTermReserve;
}

function buildPages(data: DocumentData, profile: CapacityProfile): PaginatedDocumentPage[] {
  const pages: PaginatedDocumentPage[] = [];
  const renderableItems = getRenderableLineItems(data.lineItems);
  const trailingReserve = reserveTrailingContent(data, profile);
  let currentItems = [] as DocumentData["lineItems"];
  // First page capacity is reduced by trailingReserve so totals/footer fit
  // if all items land on page 1. Continuation pages use full capacity —
  // they are never the final page, so they don't need to reserve space.
  // The final page is whatever accumulator remains after the loop; its
  // actual rendered height is controlled by the template, not the paginator.
  let currentCapacity = profile.firstPage - trailingReserve;
  let currentWeight = 0;
  let pageIsFirst = true;

  for (const item of renderableItems) {
    const nextWeight =
      getRowWeight(item.note, profile) +
      getVerboseContentWeight(data.kind, item.description, item.note);

    if (currentItems.length > 0 && currentWeight + nextWeight > currentCapacity) {
      pages.push({
        pageNumber: pages.length + 1,
        totalPages: 0,
        lineItems: currentItems,
        isFirstPage: pageIsFirst,
        isFinalPage: false,
        isContinuationPage: !pageIsFirst,
        showTotals: false,
        showNotes: false,
      });
      currentItems = [];
      // Full capacity for continuation pages — no trailing reserve deducted.
      currentCapacity = profile.continuationPage;
      currentWeight = 0;
      pageIsFirst = false;
    }

    currentItems.push(item);
    currentWeight += nextWeight;
  }

  pages.push({
    pageNumber: pages.length + 1,
    totalPages: 0,
    lineItems: currentItems,
    isFirstPage: pageIsFirst,
    isFinalPage: true,
    isContinuationPage: !pageIsFirst,
    showTotals: true,
    showNotes: true,
  });

  return pages.map((page, index, allPages) => ({
    ...page,
    pageNumber: index + 1,
    totalPages: allPages.length,
    isFirstPage: index === 0,
    isFinalPage: index === allPages.length - 1,
    isContinuationPage: index > 0,
    showTotals: index === allPages.length - 1,
    showNotes: index === allPages.length - 1,
  }));
}

function fitsOnSinglePage(data: DocumentData, profile: CapacityProfile) {
  const renderableItems = getRenderableLineItems(data.lineItems);
  const totalWeight =
    renderableItems.reduce(
      (sum, item) =>
        sum +
        getRowWeight(item.note, profile) +
        getVerboseContentWeight(data.kind, item.description, item.note),
      0,
    ) +
    reserveTrailingContent(data, profile);

  return totalWeight <= profile.firstPage;
}

export function paginateDocument(data: DocumentData): PaginatedDocument {
  const profiles = getCapacityProfiles(data);

  if (data.kind === "receipt") {
    return {
      layoutMode: "comfortable",
      pages: [
        {
          pageNumber: 1,
          totalPages: 1,
          lineItems: data.lineItems,
          isFirstPage: true,
          isFinalPage: true,
          isContinuationPage: false,
          showTotals: true,
          showNotes: true,
        },
      ],
    };
  }

  if (fitsOnSinglePage(data, profiles.comfortable)) {
    return {
      layoutMode: "comfortable",
      pages: buildPages(data, profiles.comfortable),
    };
  }

  return {
    layoutMode: "compact",
    pages: buildPages(data, profiles.compact),
  };
}
