import React from "react";
import { getThemeById } from "../../../lib/documents/templates";
import { calculateDocumentTotals, getPaymentTermSummary } from "../../../lib/documents/calculations";
import { formatCurrency } from "../../../lib/documents/format";
import { formatLineItemQuantity } from "../../../lib/documents/line-items";
import type { DocumentData, DocumentLayoutMode, LineItem } from "../../../lib/documents/types";
import { DocumentPageMeta } from "../document-page-meta";
import { DocumentPaginatedLayout } from "../document-paginated-layout";
import { DocumentShell } from "../document-shell";

const FONT = "'DM Sans', system-ui, sans-serif";

// ─── Agency template ──────────────────────────────────────────────────────────
// Reference: image 1
// - Top: contact icons top-right, brand block (logo + name) bottom-left of header
// - Big "INVOICE" block right side with solid dark bg
// - Numbered rows (01, 02…)
// - "Thank you for your business" dark banner above totals
// - Notes / terms bottom section

function AgencyLineItems({
  data,
  items,
  layoutMode,
}: {
  data: DocumentData;
  items: LineItem[];
  layoutMode: DocumentLayoutMode;
}) {
  if (data.kind === "receipt") return null;

  const compact = layoutMode === "compact";
  const cellV = compact ? "9px 12px" : "11px 14px";

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ background: "#222", printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" } as React.CSSProperties}>
          {["No", "Product Description", "Unit Price", "Qty", "Total"].map((col, i) => (
            <th
              key={col}
              style={{
                padding: compact ? "9px 12px" : "11px 14px",
                textAlign: i === 0 ? "center" : i === 1 ? "left" : "right",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: "#fff",
                width: i === 0 ? "6%" : i === 1 ? "auto" : "14%",
              }}
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => {
          const globalIndex = data.lineItems.indexOf(item);
          const rowNum = (globalIndex >= 0 ? globalIndex : index) + 1;
          return (
            <tr key={item.id} style={{ background: index % 2 === 0 ? "#fff" : "#f7f7f7" }}>
              <td style={{ padding: cellV, borderBottom: "1px solid #e8e8e8", textAlign: "center", color: "#666", fontWeight: 600, fontSize: 12 }}>
                {String(rowNum).padStart(2, "0")}
              </td>
              <td style={{ padding: cellV, borderBottom: "1px solid #e8e8e8", color: "#111", fontWeight: 500 }}>
                {item.description}
                {item.note ? (
                  <div style={{ marginTop: 3, fontSize: 11, color: "#999", fontWeight: 400, lineHeight: 1.4 }}>
                    {item.note}
                  </div>
                ) : null}
              </td>
              <td style={{ padding: cellV, borderBottom: "1px solid #e8e8e8", textAlign: "right", color: "#555", fontVariantNumeric: "tabular-nums" }}>
                {formatCurrency(item.unitPrice, data.currency)}
              </td>
              <td style={{ padding: cellV, borderBottom: "1px solid #e8e8e8", textAlign: "right", color: "#555", fontVariantNumeric: "tabular-nums" }}>
                {formatLineItemQuantity(item)}
              </td>
              <td style={{ padding: cellV, borderBottom: "1px solid #e8e8e8", textAlign: "right", color: "#111", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                {formatCurrency(item.quantity * item.unitPrice, data.currency)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function AgencyBottom({
  data,
  compact,
  accent,
}: {
  data: DocumentData;
  compact: boolean;
  accent: string;
}) {
  const totals = calculateDocumentTotals(data);
  const paymentTermSummary = getPaymentTermSummary(data);

  if (data.kind === "receipt") {
    return (
      <div style={{ marginTop: compact ? 12 : 16, display: "flex", justifyContent: "flex-end" }}>
        <div style={{ width: 240 }}>
          {data.paymentMethod ? (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid #e8e8e8" }}>
              <span style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em" }}>Payment method</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>{data.paymentMethod}</span>
            </div>
          ) : null}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#222", printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" } as React.CSSProperties}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.1em" }}>Grand Total</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: accent, fontVariantNumeric: "tabular-nums" }}>
              {formatCurrency(data.amountReceived, data.currency)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: compact ? 12 : 16 }}>
      {/* Thank you banner */}
      <div style={{ background: "#222", padding: "9px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" } as React.CSSProperties}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: "1.5px", textTransform: "uppercase" }}>
          Thank you for your business
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Sub Total</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#fff", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(totals.lineItemSubtotal, data.currency)}</span>
          </div>
          {data.applyTax ? (
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{data.taxLabel}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#fff", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(totals.taxAmount, data.currency)}</span>
            </div>
          ) : null}
          {totals.additionalFees.map((fee) => (
            <div key={fee.id} style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{fee.label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#fff", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(fee.amount, data.currency)}</span>
            </div>
          ))}
          <div style={{ display: "flex", gap: 16, alignItems: "center", borderLeft: "1px solid rgba(255,255,255,0.2)", paddingLeft: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.08em" }}>Grand Total</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: accent, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(totals.total, data.currency)}</span>
          </div>
        </div>
      </div>

      {/* Bottom: terms left, payment info right */}
      {(paymentTermSummary || data.notes) ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: compact ? 12 : 16 }}>
          {data.notes ? (
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", color: "#222", marginBottom: 6 }}>Terms &amp; Conditions</div>
              <div style={{ fontSize: 11, color: "#666", lineHeight: 1.65, whiteSpace: "pre-line" }}>{data.notes}</div>
            </div>
          ) : <div />}
          {paymentTermSummary ? (
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", color: "#222", marginBottom: 6 }}>Payment Info</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#111" }}>{paymentTermSummary.label}</div>
              <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
                Amount due now: {formatCurrency(paymentTermSummary.amountDue, data.currency)}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function NoirTemplate({ data }: { data: DocumentData }) {
  const theme = getThemeById(data.themeId);
  const { accent } = theme;

  const bleed = "clamp(1.25rem, 2.8vw, 2.5rem)";

  // Header: left = logo/brand, right top = contact details, right bottom = big INVOICE block
  const firstPageHeader = (
    <div
      style={{
        marginLeft: `calc(-1 * ${bleed})`,
        marginRight: `calc(-1 * ${bleed})`,
        marginTop: `calc(-1 * ${bleed})`,
        display: "grid",
        gridTemplateColumns: "1fr auto",
        minHeight: 110,
        borderBottom: `3px solid ${accent}`,
      }}
    >
      {/* Left: brand block */}
      <div style={{ padding: `20px ${bleed}`, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
        {data.logoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- printable document templates use runtime data URLs here
          <img src={data.logoDataUrl} alt="" style={{ height: 36, width: "auto", objectFit: "contain", marginBottom: 8, alignSelf: "flex-start" }} />
        ) : null}
        <div style={{ fontSize: 18, fontWeight: 900, color: "#111", letterSpacing: -0.5, lineHeight: 1.1 }}>{data.businessName}</div>
        <div style={{ fontSize: 10, color: "#888", marginTop: 3, lineHeight: 1.5 }}>
          {data.businessAddress.split("\n")[0]}
        </div>
      </div>

      {/* Right: top row = contact info, bottom = big INVOICE */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {/* Contact strip */}
        <div style={{ padding: "10px 20px", borderBottom: "1px solid #e8e8e8", display: "flex", gap: 16, justifyContent: "flex-end", alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "#666" }}>✉ {data.businessAddress.split("\n").slice(1).join(" ")}</span>
        </div>
        {/* INVOICE label block */}
        <div
          style={{
            flex: 1,
            background: "#222",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 28px",
            printColorAdjust: "exact",
            WebkitPrintColorAdjust: "exact",
          } as React.CSSProperties}
        >
          <div style={{ fontSize: 28, fontWeight: 900, color: accent, letterSpacing: 4, textTransform: "uppercase" }}>
            {data.kind}
          </div>
        </div>
      </div>
    </div>
  );

  // Meta row: doc details left, bill to right
  const metaRow = (toLabel: string) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, padding: "16px 0 14px", borderBottom: "1px solid #e8e8e8", marginBottom: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <span style={{ fontSize: 11, color: "#888", width: 80 }}>Invoice No :</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#111" }}>{data.documentNumber}</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <span style={{ fontSize: 11, color: "#888", width: 80 }}>Date :</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#111" }}>{data.documentDate}</span>
        </div>
        {data.validUntil ? (
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ fontSize: 11, color: "#888", width: 80 }}>Due Date :</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#111" }}>{data.validUntil}</span>
          </div>
        ) : null}
      </div>
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#888", marginBottom: 5 }}>{toLabel}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 2 }}>{data.customerName}</div>
        <div style={{ fontSize: 11, color: "#777", lineHeight: 1.6, whiteSpace: "pre-line" }}>{data.customerAddress}</div>
      </div>
    </div>
  );

  const continuationHeader = (pageNumber: number, totalPages: number) => (
    <div
      style={{
        marginLeft: `calc(-1 * ${bleed})`,
        marginRight: `calc(-1 * ${bleed})`,
        marginTop: `calc(-1 * ${bleed})`,
        borderBottom: `3px solid ${accent}`,
        padding: `14px ${bleed}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 900, color: "#111" }}>{data.businessName}</span>
      <span style={{ fontSize: 12, color: "#888" }}>{data.kind.toUpperCase()} · {data.documentNumber}</span>
      <DocumentPageMeta data={data} pageNumber={pageNumber} totalPages={totalPages} />
    </div>
  );

  const footer = (
    <div
      data-template-footer="noir"
      style={{
        marginLeft: `calc(-1 * ${bleed})`,
        marginRight: `calc(-1 * ${bleed})`,
        borderTop: `3px solid ${accent}`,
        padding: `10px ${bleed}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "auto",
      }}
    >
      <span style={{ fontSize: 10, fontWeight: 700, color: "#555", letterSpacing: 1, textTransform: "uppercase" }}>
        {data.businessName}
      </span>
      <span style={{ fontSize: 10, color: "#bbb" }}>
        {data.kind} · {data.documentNumber}
      </span>
    </div>
  );

  const autoGeneratedNote = (
    <div style={{ marginTop: 14, fontSize: 11, color: "#aaa", lineHeight: 1.65 }}>
      This is an auto-generated document. No signature required.
    </div>
  );

  if (data.kind === "receipt") {
    return (
      <DocumentShell accentClass="">
        <div style={{ fontFamily: FONT, display: "flex", flexDirection: "column", flex: 1 }}>
          {firstPageHeader}
          {metaRow("Received from")}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <AgencyBottom data={data} compact={false} accent={accent} />
            {autoGeneratedNote}
          </div>
          {footer}
        </div>
      </DocumentShell>
    );
  }

  return (
    <DocumentPaginatedLayout
      data={data}
      renderPage={(page, layoutMode) => (
        <DocumentShell accentClass="" continuation={page.isContinuationPage}>
          <div style={{ fontFamily: FONT, display: "flex", flexDirection: "column", flex: 1 }}>
            {page.isFirstPage ? (
              <>
                {firstPageHeader}
                {metaRow(data.kind === "invoice" ? "Bill to" : "Prepared for")}
                {page.totalPages > 1 ? (
                  <div style={{ marginBottom: 12 }}>
                    <DocumentPageMeta data={data} pageNumber={page.pageNumber} totalPages={page.totalPages} />
                  </div>
                ) : null}
              </>
            ) : (
              continuationHeader(page.pageNumber, page.totalPages)
            )}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <AgencyLineItems data={data} items={page.lineItems} layoutMode={layoutMode} />
              {page.showTotals ? (
                <>
                  <AgencyBottom data={data} compact={layoutMode === "compact"} accent={accent} />
                  {autoGeneratedNote}
                </>
              ) : null}
            </div>
          </div>
          {page.isFinalPage ? footer : null}
        </DocumentShell>
      )}
    />
  );
}
