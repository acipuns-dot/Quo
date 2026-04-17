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

// ─── Corporate template ───────────────────────────────────────────────────────
// Reference: image 4
// - Full-width top info bar: logo + name left, contact details centre, website right
// - "INVOICE TO" + customer block left, large "INVOICE" title right
// - Doc details (number, date, customer#) with solid accent left-border blocks beside them
// - REF column in table + shaded header row
// - Bottom: payment methods box left, totals table right
// - "Thank You For Your Business" + footer

function CorporateLineItems({
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
  const cellV = compact ? "8px 10px" : "10px 12px";

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, border: "1px solid #d0d0d0" }}>
      <thead>
        <tr style={{ background: "#e0e0e0" }}>
          {["Ref", "Item Description", "Unit Price", "Quantity", "Total"].map((col, i) => (
            <th
              key={col}
              style={{
                padding: compact ? "8px 10px" : "10px 12px",
                textAlign: i <= 1 ? "left" : "right",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                color: "#333",
                border: "1px solid #d0d0d0",
                width: i === 0 ? "8%" : i === 1 ? "auto" : "14%",
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
          const refNum = (globalIndex >= 0 ? globalIndex : index) + 1;
          return (
            <tr key={item.id} style={{ background: index % 2 === 0 ? "#fff" : "#f9f9f9" }}>
              <td style={{ padding: cellV, border: "1px solid #d0d0d0", textAlign: "left", color: "#666", fontWeight: 600 }}>
                {refNum}
              </td>
              <td style={{ padding: cellV, border: "1px solid #d0d0d0", color: "#111" }}>
                {item.description}
                {item.note ? (
                  <div style={{ marginTop: 3, fontSize: 10, color: "#999", lineHeight: 1.4 }}>
                    {item.note}
                  </div>
                ) : null}
              </td>
              <td style={{ padding: cellV, border: "1px solid #d0d0d0", textAlign: "right", color: "#555", fontVariantNumeric: "tabular-nums" }}>
                {formatCurrency(item.unitPrice, data.currency)}
              </td>
              <td style={{ padding: cellV, border: "1px solid #d0d0d0", textAlign: "right", color: "#555", fontVariantNumeric: "tabular-nums" }}>
                {formatLineItemQuantity(item)}
              </td>
              <td style={{ padding: cellV, border: "1px solid #d0d0d0", textAlign: "right", color: "#111", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                {formatCurrency(item.quantity * item.unitPrice, data.currency)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function CorporateBottom({
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
      <div style={{ marginTop: compact ? 14 : 20, display: "flex", justifyContent: "flex-end" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 12, width: 240 }}>
          <tbody>
            {data.paymentMethod ? (
              <tr>
                <td style={{ padding: "7px 10px", border: "1px solid #d0d0d0", color: "#555" }}>Payment method</td>
                <td style={{ padding: "7px 10px", border: "1px solid #d0d0d0", textAlign: "right", fontWeight: 600, color: "#111" }}>{data.paymentMethod}</td>
              </tr>
            ) : null}
            <tr style={{ background: accent, printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" } as React.CSSProperties}>
              <td style={{ padding: "9px 10px", border: "1px solid #d0d0d0", fontWeight: 700, color: "#fff", textTransform: "uppercase", fontSize: 11 }}>Total</td>
              <td style={{ padding: "9px 10px", border: "1px solid #d0d0d0", textAlign: "right", fontWeight: 800, color: "#fff", fontSize: 14, fontVariantNumeric: "tabular-nums" }}>
                {formatCurrency(data.amountReceived, data.currency)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: compact ? 14 : 20, alignItems: "start" }}>
      {/* Left: payment methods box */}
      <div>
        {paymentTermSummary ? (
          <div style={{ border: "1px solid #d0d0d0", padding: "10px 12px", marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase", color: "#fff", background: "#222", padding: "5px 8px", margin: "-10px -12px 8px" } as React.CSSProperties}>
              Payment Methods:
            </div>
            <div style={{ fontSize: 11, color: "#444", lineHeight: 1.7 }}>
              <div>{paymentTermSummary.label}</div>
              <div>Amount due now: {formatCurrency(paymentTermSummary.amountDue, data.currency)}</div>
            </div>
          </div>
        ) : null}
        {data.notes ? (
          <div style={{ border: "1px solid #d0d0d0", padding: "10px 12px" }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase", background: "#222", padding: "5px 8px", margin: "-10px -12px 8px", color: "#fff" } as React.CSSProperties}>
              Terms &amp; Conditions
            </div>
            <div style={{ fontSize: 11, color: "#555", lineHeight: 1.65, whiteSpace: "pre-line" }}>{data.notes}</div>
          </div>
        ) : null}
      </div>

      {/* Right: totals table */}
      <table style={{ borderCollapse: "collapse", fontSize: 12, width: "100%" }}>
        <tbody>
          <tr>
            <td style={{ padding: "7px 10px", border: "1px solid #d0d0d0", color: "#555" }}>Subtotal</td>
            <td style={{ padding: "7px 10px", border: "1px solid #d0d0d0", textAlign: "right", color: "#333", fontVariantNumeric: "tabular-nums" }}>
              {formatCurrency(totals.lineItemSubtotal, data.currency)}
            </td>
          </tr>
          {totals.additionalFees.map((fee) => (
            <tr key={fee.id}>
              <td style={{ padding: "7px 10px", border: "1px solid #d0d0d0", color: "#555" }}>{fee.label}</td>
              <td style={{ padding: "7px 10px", border: "1px solid #d0d0d0", textAlign: "right", color: "#333", fontVariantNumeric: "tabular-nums" }}>
                {formatCurrency(fee.amount, data.currency)}
              </td>
            </tr>
          ))}
          {data.applyTax ? (
            <tr>
              <td style={{ padding: "7px 10px", border: "1px solid #d0d0d0", color: "#555" }}>{data.taxLabel}</td>
              <td style={{ padding: "7px 10px", border: "1px solid #d0d0d0", textAlign: "right", color: "#333", fontVariantNumeric: "tabular-nums" }}>
                {formatCurrency(totals.taxAmount, data.currency)}
              </td>
            </tr>
          ) : null}
          <tr style={{ background: accent, printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" } as React.CSSProperties}>
            <td style={{ padding: "9px 10px", border: "1px solid #d0d0d0", fontWeight: 700, color: "#fff", textTransform: "uppercase", fontSize: 11 }}>Total Due</td>
            <td style={{ padding: "9px 10px", border: "1px solid #d0d0d0", textAlign: "right", fontWeight: 800, color: "#fff", fontSize: 14, fontVariantNumeric: "tabular-nums" }}>
              {formatCurrency(totals.total, data.currency)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function PulseTemplate({ data }: { data: DocumentData }) {
  const theme = getThemeById(data.themeId);
  const { accent } = theme;

  const bleed = "clamp(1.25rem, 2.8vw, 2.5rem)";

  // Full-width top info bar: accent bg, logo left, address lines right
  const topInfoBar = (
    <div
      style={{
        marginLeft: `calc(-1 * ${bleed})`,
        marginRight: `calc(-1 * ${bleed})`,
        marginTop: `calc(-1 * ${bleed})`,
        background: accent,
        padding: `14px ${bleed}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        printColorAdjust: "exact",
        WebkitPrintColorAdjust: "exact",
      } as React.CSSProperties}
    >
      {/* Left: logo + name */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {data.logoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- printable document templates use runtime data URLs here
          <img src={data.logoDataUrl} alt="" style={{ height: 32, width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
        ) : null}
        <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", letterSpacing: -0.3 }}>{data.businessName}</div>
      </div>

      {/* Right: address lines */}
      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        {data.businessAddress.split("\n").map((line, i) => (
          <span key={i} style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>{line}</span>
        ))}
      </div>
    </div>
  );

  // Header: INVOICE TO left, big INVOICE right, doc detail rows with accent sidebar
  const firstPageHeader = (toLabel: string) => (
    <div style={{ paddingTop: 18, paddingBottom: 14, borderBottom: "2px solid #222", marginBottom: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
        {/* Left: invoice to */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase", color: "#333", marginBottom: 8 }}>
            {toLabel}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 3 }}>{data.customerName}</div>
          <div style={{ fontSize: 11, color: "#666", lineHeight: 1.6, whiteSpace: "pre-line" }}>{data.customerAddress}</div>
        </div>

        {/* Right: large INVOICE + doc detail rows with accent left-border */}
        <div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#111", textTransform: "uppercase", letterSpacing: -1, lineHeight: 1, marginBottom: 12, textAlign: "right" }}>
            {data.kind}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { label: "Invoice #:", value: data.documentNumber },
              { label: "Invoice Date:", value: data.documentDate },
              ...(data.validUntil ? [{ label: "Due Date:", value: data.validUntil }] : []),
            ].map((row) => (
              <div
                key={row.label}
                style={{ display: "flex", alignItems: "center", borderLeft: `3px solid ${accent}`, paddingLeft: 8, gap: 8 }}
              >
                <span style={{ fontSize: 11, color: "#888", minWidth: 90 }}>{row.label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#111" }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const continuationHeader = (pageNumber: number, totalPages: number) => (
    <div
      style={{
        marginLeft: `calc(-1 * ${bleed})`,
        marginRight: `calc(-1 * ${bleed})`,
        marginTop: `calc(-1 * ${bleed})`,
        background: accent,
        padding: `12px ${bleed}`,
        marginBottom: 14,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        printColorAdjust: "exact",
        WebkitPrintColorAdjust: "exact",
      } as React.CSSProperties}
    >
      <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{data.businessName}</span>
      <DocumentPageMeta data={data} pageNumber={pageNumber} totalPages={totalPages} />
    </div>
  );

  const footer = (
    <div
      data-template-footer="pulse"
      style={{
        marginLeft: `calc(-1 * ${bleed})`,
        marginRight: `calc(-1 * ${bleed})`,
        marginTop: "auto",
        borderTop: `3px solid ${accent}`,
        background: "#f5f5f5",
        padding: `10px ${bleed}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 700, color: "#333", letterSpacing: "1px", textTransform: "uppercase" }}>
        Thank You For Your Business
      </span>
      <span style={{ fontSize: 10, color: "#999" }}>
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
          {topInfoBar}
          {firstPageHeader("Received from")}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <CorporateBottom data={data} compact={false} accent={accent} />
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
                {topInfoBar}
                {firstPageHeader(data.kind === "invoice" ? "Invoice To" : "Prepared For")}
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
              <CorporateLineItems data={data} items={page.lineItems} layoutMode={layoutMode} accent={accent} />
              {page.showTotals ? (
                <>
                  <CorporateBottom data={data} compact={layoutMode === "compact"} accent={accent} />
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
