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

// ─── Wave template ────────────────────────────────────────────────────────────
// Reference: image 2
// - Header: dark bg with SVG wave bottom edge, logo + business name left, contact icons top-right
// - "INVOICE" large right-aligned text mid-page
// - Customer address left + doc details (key:value rows) right — between header and table
// - Dark full-width table header, alternating rows
// - Totals right-aligned, payment info + T&C left

function WaveLineItems({
  data,
  items,
  layoutMode,
  accent,
  dark,
}: {
  data: DocumentData;
  items: LineItem[];
  layoutMode: DocumentLayoutMode;
  accent: string;
  dark: string;
}) {
  if (data.kind === "receipt") return null;

  const compact = layoutMode === "compact";
  const cellV = compact ? "9px 14px" : "12px 16px";

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ background: dark, printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" } as React.CSSProperties}>
          {["Product Descriptions", "Price", "Qty.", "Total"].map((col, i) => (
            <th
              key={col}
              style={{
                padding: compact ? "9px 14px" : "11px 16px",
                textAlign: i === 0 ? "left" : "right",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "#fff",
                width: i === 0 ? "auto" : "15%",
              }}
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={item.id} style={{ background: index % 2 === 0 ? "#fff" : "#f5f5f5" }}>
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
        ))}
      </tbody>
    </table>
  );
}

function WaveBottom({
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
        <div style={{ width: 260 }}>
          {data.paymentMethod ? (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e8e8e8" }}>
              <span style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em" }}>Payment method</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>{data.paymentMethod}</span>
            </div>
          ) : null}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: accent, borderRadius: 4, marginTop: 8, printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" } as React.CSSProperties}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.08em" }}>Total</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
              {formatCurrency(data.amountReceived, data.currency)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: compact ? 14 : 20, alignItems: "start" }}>
      {/* Left: payment info + notes */}
      <div>
        {paymentTermSummary ? (
          <div style={{ marginBottom: data.notes ? 14 : 0 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", color: "#111", marginBottom: 6 }}>Payment Info:</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#333" }}>{paymentTermSummary.label}</div>
            <div style={{ fontSize: 11, color: "#666", marginTop: 3 }}>
              Amount due now: {formatCurrency(paymentTermSummary.amountDue, data.currency)}
            </div>
          </div>
        ) : null}
        {data.notes ? (
          <>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", color: "#111", marginBottom: 6 }}>
              Terms &amp; Conditions:
            </div>
            <div style={{ fontSize: 11, color: "#666", lineHeight: 1.65, whiteSpace: "pre-line" }}>{data.notes}</div>
          </>
        ) : null}
        {!paymentTermSummary && !data.notes ? (
          <div style={{ fontSize: 12, fontWeight: 700, color: "#333" }}>Thank You For Your Business.</div>
        ) : (
          <div style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: "#333" }}>Thank You For Your Business.</div>
        )}
      </div>

      {/* Right: totals */}
      <div>
        {[
          { label: "Sub Total", value: formatCurrency(totals.lineItemSubtotal, data.currency), highlight: false },
          ...totals.additionalFees.map((f) => ({ label: f.label, value: formatCurrency(f.amount, data.currency), highlight: false })),
          ...(data.applyTax ? [{ label: `${data.taxLabel}`, value: formatCurrency(totals.taxAmount, data.currency), highlight: false }] : []),
        ].map((row) => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid #e8e8e8" }}>
            <span style={{ fontSize: 11, color: "#888" }}>{row.label}</span>
            <span style={{ fontSize: 12, color: "#333", fontVariantNumeric: "tabular-nums" }}>{row.value}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: accent, borderRadius: 4, marginTop: 6, printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" } as React.CSSProperties}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.08em" }}>Total</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
            {formatCurrency(totals.total, data.currency)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function StudioTemplate({ data }: { data: DocumentData }) {
  const theme = getThemeById(data.themeId);
  const { accent, dark } = theme;

  const bleed = "clamp(1.25rem, 2.8vw, 2.5rem)";

  // Wave header — dark bg, SVG wave at bottom
  const waveHeader = (
    <div
      style={{
        marginLeft: `calc(-1 * ${bleed})`,
        marginRight: `calc(-1 * ${bleed})`,
        marginTop: `calc(-1 * ${bleed})`,
        background: dark,
        position: "relative",
        paddingBottom: 28,
        printColorAdjust: "exact",
        WebkitPrintColorAdjust: "exact",
      } as React.CSSProperties}
    >
      {/* Content row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: `20px ${bleed} 0` }}>
        {/* Left: logo + name */}
        <div>
          {data.logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- printable document templates use runtime data URLs here
            <img src={data.logoDataUrl} alt="" style={{ height: 36, width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)", marginBottom: 8 }} />
          ) : null}
          <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", letterSpacing: -0.3, lineHeight: 1.1 }}>
            {data.businessName}
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginTop: 3, letterSpacing: "1px" }}>
            {data.businessAddress.split("\n")[0]}
          </div>
        </div>

        {/* Right: contact row */}
        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 4 }}>
          {data.businessAddress.split("\n").slice(1).map((line, i) => (
            <div key={i} style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>{line}</div>
          ))}
        </div>
      </div>

      {/* SVG wave */}
      <svg
        style={{ position: "absolute", bottom: 0, left: 0, right: 0, width: "100%", display: "block" }}
        viewBox="0 0 800 28"
        preserveAspectRatio="none"
        fill="none"
      >
        <path d="M0 28 C200 0 600 28 800 0 L800 28 Z" fill={accent} opacity="0.9" />
        <path d="M0 28 C200 8 600 28 800 10 L800 28 Z" fill={accent} />
      </svg>
    </div>
  );

  // "INVOICE" large text + client/doc meta row
  const invoiceBlock = (toLabel: string) => (
    <div style={{ paddingTop: 18, paddingBottom: 14, borderBottom: "1px solid #e8e8e8", marginBottom: 16 }}>
      {/* Big INVOICE title right-aligned */}
      <div style={{ textAlign: "right", marginBottom: 14 }}>
        <div style={{ fontSize: 34, fontWeight: 900, color: dark, letterSpacing: -1, textTransform: "uppercase", lineHeight: 1 }}>
          {data.kind}
        </div>
      </div>
      {/* Two-column: customer left, doc details right */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#888", marginBottom: 5 }}>
            {toLabel}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 2 }}>{data.customerName}</div>
          <div style={{ fontSize: 11, color: "#666", lineHeight: 1.6, whiteSpace: "pre-line" }}>{data.customerAddress}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            { label: "Invoice No", value: data.documentNumber },
            { label: "Date", value: data.documentDate },
            ...(data.validUntil ? [{ label: "Due Date", value: data.validUntil }] : []),
          ].map((row) => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#888" }}>{row.label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#111" }}>: &nbsp;{row.value}</span>
            </div>
          ))}
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
        background: dark,
        padding: `14px ${bleed}`,
        marginBottom: 16,
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
      data-template-footer="studio"
      style={{
        marginLeft: `calc(-1 * ${bleed})`,
        marginRight: `calc(-1 * ${bleed})`,
        background: dark,
        padding: `10px ${bleed}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "auto",
        printColorAdjust: "exact",
        WebkitPrintColorAdjust: "exact",
      } as React.CSSProperties}
    >
      <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: 1, textTransform: "uppercase" }}>
        {data.businessName}
      </span>
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
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
          {waveHeader}
          {invoiceBlock("Received from")}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <WaveBottom data={data} compact={false} accent={accent} />
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
                {waveHeader}
                {invoiceBlock(data.kind === "invoice" ? "Bill to" : "Prepared for")}
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
              <WaveLineItems data={data} items={page.lineItems} layoutMode={layoutMode} accent={accent} dark={dark} />
              {page.showTotals ? (
                <>
                  <WaveBottom data={data} compact={layoutMode === "compact"} accent={accent} />
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
