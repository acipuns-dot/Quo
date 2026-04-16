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

// ─── Ledger template ──────────────────────────────────────────────────────────
// Reference: spreadsheet-style invoice
// - Logo top-left, "INVOICE" top-right, DATE / INVOICE NO. right-aligned
// - FROM block left, BILL TO + SHIP TO two-column right
// - Payment terms line full-width
// - Bordered table (no shading), Description / QTY / Unit Price / Total
// - Bottom-left: Methods / Payment Instructions box
// - Bottom-right: Subtotal / Discount / Tax / Total / Balance Due rows
// - No footer bar — very clean document feel

function LedgerLineItems({
  data,
  items,
  layoutMode,
  accent,
}: {
  data: DocumentData;
  items: LineItem[];
  layoutMode: DocumentLayoutMode;
  accent: string;
}) {
  if (data.kind === "receipt") return null;

  const compact = layoutMode === "compact";
  const cellPad = compact ? "7px 10px" : "9px 12px";

  const borderCell: React.CSSProperties = {
    border: "1px solid #c8c8c8",
    padding: cellPad,
    fontSize: 12,
    color: "#111",
  };

  const emptyRows = Math.max(0, 5 - items.length);

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
      <thead>
        <tr style={{ background: accent, printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" } as React.CSSProperties}>
          {["Description", "Qty", "Unit Price", "Total"].map((col, i) => (
            <th
              key={col}
              style={{
                border: "1px solid #c8c8c8",
                padding: compact ? "7px 10px" : "9px 12px",
                textAlign: i === 0 ? "left" : "right",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "#fff",
                width: i === 0 ? "auto" : i === 1 ? "10%" : "16%",
              }}
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td style={{ ...borderCell, fontWeight: 500 }}>
              {item.description}
              {item.note ? (
                <div style={{ marginTop: 3, fontSize: 10, color: "#999", lineHeight: 1.4 }}>
                  {item.note}
                </div>
              ) : null}
            </td>
            <td style={{ ...borderCell, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
              {formatLineItemQuantity(item)}
            </td>
            <td style={{ ...borderCell, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
              {formatCurrency(item.unitPrice, data.currency)}
            </td>
            <td style={{ ...borderCell, textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
              {formatCurrency(item.quantity * item.unitPrice, data.currency)}
            </td>
          </tr>
        ))}
        {/* Empty filler rows so the table always looks full on short item lists */}
        {emptyRows > 0 && Array.from({ length: emptyRows }).map((_, i) => (
          <tr key={`empty-${i}`}>
            <td style={{ ...borderCell, color: "transparent" }}>—</td>
            <td style={{ ...borderCell }} />
            <td style={{ ...borderCell }} />
            <td style={{ ...borderCell }} />
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function LedgerBottom({
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
        <table style={{ borderCollapse: "collapse", width: 260 }}>
          <tbody>
            {data.paymentMethod ? (
              <tr>
                <td style={{ border: "1px solid #c8c8c8", padding: "7px 10px", fontSize: 11, color: "#555" }}>Payment method</td>
                <td style={{ border: "1px solid #c8c8c8", padding: "7px 10px", fontSize: 11, textAlign: "right", fontWeight: 600, color: "#111" }}>{data.paymentMethod}</td>
              </tr>
            ) : null}
            <tr style={{ background: accent, printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" } as React.CSSProperties}>
              <td style={{ border: "1px solid #c8c8c8", padding: "8px 10px", fontSize: 11, fontWeight: 700, color: "#fff", textTransform: "uppercase" }}>Balance Due</td>
              <td style={{ border: "1px solid #c8c8c8", padding: "8px 10px", fontSize: 13, fontWeight: 800, color: "#fff", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {formatCurrency(data.amountReceived, data.currency)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  const summaryRows: { label: string; value: string; bold?: boolean; highlight?: boolean }[] = [
    { label: "Subtotal", value: formatCurrency(totals.lineItemSubtotal, data.currency) },
    ...totals.additionalFees.map((f) => ({ label: f.label, value: formatCurrency(f.amount, data.currency) })),
    ...(data.applyTax ? [{ label: data.taxLabel, value: formatCurrency(totals.taxAmount, data.currency) }] : []),
    { label: "Total", value: formatCurrency(totals.total, data.currency), bold: true },
    { label: "Balance Due", value: formatCurrency(totals.total, data.currency), bold: true, highlight: true },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: compact ? 12 : 16, alignItems: "start" }}>
      {/* Left: payment instructions */}
      <div style={{ border: "1px solid #c8c8c8", padding: "10px 12px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#444", marginBottom: 6 }}>
          Methods / Payment Instructions
        </div>
        {paymentTermSummary ? (
          <div style={{ fontSize: 11, color: "#555", lineHeight: 1.65 }}>
            <div>{paymentTermSummary.label}</div>
            <div>Amount due now: {formatCurrency(paymentTermSummary.amountDue, data.currency)}</div>
          </div>
        ) : null}
        {data.notes ? (
          <div style={{ fontSize: 11, color: "#555", lineHeight: 1.65, marginTop: paymentTermSummary ? 6 : 0, whiteSpace: "pre-line" }}>
            {data.notes}
          </div>
        ) : null}
        {!paymentTermSummary && !data.notes ? (
          <div style={{ fontSize: 11, color: "#bbb" }}>—</div>
        ) : null}
      </div>

      {/* Right: totals table */}
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>
        <tbody>
          {summaryRows.map((row) => (
            <tr
              key={row.label}
              style={row.highlight
                ? { background: accent, printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" } as React.CSSProperties
                : undefined}
            >
              <td style={{
                border: "1px solid #c8c8c8",
                padding: "7px 10px",
                fontWeight: row.bold ? 700 : 400,
                color: row.highlight ? "#fff" : "#555",
                textTransform: row.bold ? "uppercase" : undefined,
                fontSize: row.highlight ? 11 : 12,
                letterSpacing: row.bold ? "0.05em" : undefined,
              }}>
                {row.label}
              </td>
              <td style={{
                border: "1px solid #c8c8c8",
                padding: "7px 10px",
                textAlign: "right",
                fontWeight: row.bold ? 700 : 400,
                color: row.highlight ? "#fff" : "#333",
                fontSize: row.highlight ? 13 : 12,
                fontVariantNumeric: "tabular-nums",
              }}>
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LedgerTemplate({ data }: { data: DocumentData }) {
  const theme = getThemeById(data.themeId);
  const { accent } = theme;

  const bleed = "clamp(1.25rem, 2.8vw, 2.5rem)";

  // Top header: logo left, INVOICE + date/number right
  const topHeader = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
      {/* Logo / brand left */}
      <div>
        {data.logoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- printable document templates use runtime data URLs here
          <img src={data.logoDataUrl} alt="" style={{ height: 48, width: "auto", objectFit: "contain" }} />
        ) : (
          <div
            style={{
              width: 64,
              height: 48,
              border: `2px solid ${accent}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              fontWeight: 700,
              color: accent,
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            LOGO
          </div>
        )}
      </div>

      {/* Right: title + meta */}
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 26, fontWeight: 900, color: accent, letterSpacing: 2, textTransform: "uppercase", lineHeight: 1 }}>
          {data.kind}
        </div>
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, alignItems: "center" }}>
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", color: "#888" }}>Date</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#111", minWidth: 90, textAlign: "left" }}>{data.documentDate}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, alignItems: "center" }}>
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", color: "#888" }}>Invoice No.</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#111", minWidth: 90, textAlign: "left" }}>{data.documentNumber}</span>
          </div>
          {data.validUntil ? (
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, alignItems: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", color: "#888" }}>Due Date</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#111", minWidth: 90, textAlign: "left" }}>{data.validUntil}</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  // From left + Bill To / Ship To right
  const partiesBlock = (toLabel: string) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #ddd" }}>
      {/* Left: FROM */}
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#888", marginBottom: 5 }}>From</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 2 }}>{data.businessName}</div>
        <div style={{ fontSize: 11, color: "#555", lineHeight: 1.7, whiteSpace: "pre-line" }}>
          {data.businessAddress}
        </div>
      </div>

      {/* Right: BILL TO + SHIP TO */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#888", marginBottom: 5 }}>{toLabel}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 2 }}>{data.customerName}</div>
          <div style={{ fontSize: 11, color: "#555", lineHeight: 1.7, whiteSpace: "pre-line" }}>{data.customerAddress}</div>
        </div>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#888", marginBottom: 5 }}>Ship To</div>
          <div style={{ fontSize: 11, color: "#aaa", lineHeight: 1.7 }}>Same as {toLabel.toLowerCase()}</div>
        </div>
      </div>
    </div>
  );

  const continuationHeader = (pageNumber: number, totalPages: number) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, marginBottom: 14, borderBottom: "1px solid #ddd" }}>
      <div style={{ fontSize: 14, fontWeight: 900, color: "#111" }}>{data.businessName}</div>
      <DocumentPageMeta data={data} pageNumber={pageNumber} totalPages={totalPages} />
    </div>
  );

  const footer = (
    <div
      data-template-footer="ledger"
      style={{
        marginLeft: `calc(-1 * ${bleed})`,
        marginRight: `calc(-1 * ${bleed})`,
        borderTop: "1px solid #ddd",
        padding: `10px ${bleed}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "auto",
      }}
    >
      <span style={{ fontSize: 10, color: "#999", letterSpacing: 0.5 }}>
        {data.businessName}
      </span>
      <span style={{ fontSize: 10, color: "#ccc" }}>
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
          {topHeader}
          {partiesBlock("Received from")}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <LedgerBottom data={data} compact={false} accent={accent} />
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
                {topHeader}
                {partiesBlock(data.kind === "invoice" ? "Bill To" : "Prepared For")}
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
              <LedgerLineItems data={data} items={page.lineItems} layoutMode={layoutMode} accent={accent} />
              {page.showTotals ? (
                <>
                  <LedgerBottom data={data} compact={layoutMode === "compact"} accent={accent} />
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
