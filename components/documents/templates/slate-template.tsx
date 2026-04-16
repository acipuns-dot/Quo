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

// ─── Gradient template ────────────────────────────────────────────────────────
// Reference: image 3
// - Minimal white header: logo left, "Billing To" customer block left, large "INVOICE"
//   right with gradient accent column showing doc number / date / due date
// - Clean table, alternating rows
// - Gradient footer bar with contact icons
// - Payment method + T&C + signature bottom section

function GradientLineItems({
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
  const cellV = compact ? "9px 12px" : "11px 14px";

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr>
          {["St", "Item Description", "Qty", "Rate", "Amount"].map((col, i) => (
            <th
              key={col}
              style={{
                padding: compact ? "9px 12px" : "11px 14px",
                textAlign: i <= 1 ? "left" : "right",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "#fff",
                background: accent,
                width: i === 0 ? "6%" : i === 1 ? "auto" : "13%",
                printColorAdjust: "exact",
                WebkitPrintColorAdjust: "exact",
              } as React.CSSProperties}
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
            <tr key={item.id} style={{ background: index % 2 === 0 ? "#fff" : "#f5f7fb" }}>
              <td style={{ padding: cellV, borderBottom: "1px solid #e4e8f0", textAlign: "left", color: "#888", fontWeight: 600, fontSize: 12 }}>
                {rowNum}
              </td>
              <td style={{ padding: cellV, borderBottom: "1px solid #e4e8f0", color: "#111", fontWeight: 500 }}>
                {item.description}
                {item.note ? (
                  <div style={{ marginTop: 3, fontSize: 11, color: "#aaa", fontWeight: 400, lineHeight: 1.4 }}>
                    {item.note}
                  </div>
                ) : null}
              </td>
              <td style={{ padding: cellV, borderBottom: "1px solid #e4e8f0", textAlign: "right", color: "#555", fontVariantNumeric: "tabular-nums" }}>
                {formatLineItemQuantity(item)}
              </td>
              <td style={{ padding: cellV, borderBottom: "1px solid #e4e8f0", textAlign: "right", color: "#555", fontVariantNumeric: "tabular-nums" }}>
                {formatCurrency(item.unitPrice, data.currency)}
              </td>
              <td style={{ padding: cellV, borderBottom: "1px solid #e4e8f0", textAlign: "right", color: "#111", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                {formatCurrency(item.quantity * item.unitPrice, data.currency)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function GradientBottom({
  data,
  compact,
  gradient,
}: {
  data: DocumentData;
  compact: boolean;
  gradient: string;
}) {
  const totals = calculateDocumentTotals(data);
  const paymentTermSummary = getPaymentTermSummary(data);

  if (data.kind === "receipt") {
    return (
      <div style={{ marginTop: compact ? 14 : 20 }}>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: 240 }}>
            {data.paymentMethod ? (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e4e8f0" }}>
                <span style={{ fontSize: 11, color: "#888" }}>Payment method</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>{data.paymentMethod}</span>
              </div>
            ) : null}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: gradient, borderRadius: 4, marginTop: 8, printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" } as React.CSSProperties}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", textTransform: "uppercase" }}>Total</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
                {formatCurrency(data.amountReceived, data.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: compact ? 14 : 20 }}>
      {/* Totals right-aligned */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{ width: 260 }}>
          {[
            { label: "SubTotal", value: formatCurrency(totals.lineItemSubtotal, data.currency) },
            ...totals.additionalFees.map((f) => ({ label: f.label, value: formatCurrency(f.amount, data.currency) })),
            ...(data.applyTax ? [{ label: `Tax ${data.taxLabel}`, value: formatCurrency(totals.taxAmount, data.currency) }] : []),
          ].map((row) => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 12px", borderBottom: "1px solid #e4e8f0" }}>
              <span style={{ fontSize: 11, color: "#888" }}>{row.label}</span>
              <span style={{ fontSize: 12, color: "#333", fontVariantNumeric: "tabular-nums" }}>{row.value}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: gradient, borderRadius: 4, marginTop: 6, printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" } as React.CSSProperties}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.08em" }}>Total</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
              {formatCurrency(totals.total, data.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment method + notes two-column */}
      {(paymentTermSummary || data.notes) ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: compact ? 14 : 20 }}>
          {paymentTermSummary ? (
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", color: "#111", marginBottom: 6 }}>Payment Method:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "#888", minWidth: 80 }}>{paymentTermSummary.label}</span>
                </div>
                <div style={{ fontSize: 11, color: "#666" }}>
                  Amount due now: {formatCurrency(paymentTermSummary.amountDue, data.currency)}
                </div>
              </div>
            </div>
          ) : <div />}
          {data.notes ? (
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", color: "#111", marginBottom: 6 }}>Terms &amp; Conditions:</div>
              <div style={{ fontSize: 11, color: "#666", lineHeight: 1.65, whiteSpace: "pre-line" }}>{data.notes}</div>
            </div>
          ) : null}
        </div>
      ) : null}

    </div>
  );
}

export function SlateTemplate({ data }: { data: DocumentData }) {
  const theme = getThemeById(data.themeId);
  const { accent, gradient } = theme;

  const bleed = "clamp(1.25rem, 2.8vw, 2.5rem)";

  // Minimal header: logo left, then billing + INVOICE block
  const firstPageHeader = (toLabel: string) => (
    <div style={{ marginBottom: 16 }}>
      {/* Top row: logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 16, borderBottom: "1px solid #e4e8f0", marginBottom: 16 }}>
        {data.logoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- printable document templates use runtime data URLs here
          <img src={data.logoDataUrl} alt="" style={{ height: 36, width: "auto", objectFit: "contain" }} />
        ) : (
          <div style={{ fontSize: 18, fontWeight: 900, color: "#111", letterSpacing: -0.5 }}>{data.businessName}</div>
        )}
        {data.logoDataUrl ? (
          <div style={{ fontSize: 16, fontWeight: 900, color: "#111", letterSpacing: -0.3 }}>{data.businessName}</div>
        ) : null}
        <div style={{ fontSize: 9, color: "#aaa", marginLeft: 6, lineHeight: 1.6 }}>
          {data.businessAddress.split("\n")[0]}
        </div>
      </div>

      {/* Billing info left + INVOICE block right */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "start" }}>
        {/* Left: billing */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#888", marginBottom: 6 }}>
            {toLabel}:
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{data.customerName}</div>
            <div style={{ fontSize: 11, color: "#666", lineHeight: 1.6, whiteSpace: "pre-line" }}>{data.customerAddress}</div>
          </div>
        </div>

        {/* Right: INVOICE title + accent doc-info column */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <div style={{ fontSize: 30, fontWeight: 900, color: "#111", textTransform: "uppercase", letterSpacing: -0.5, lineHeight: 1 }}>
            {data.kind}
          </div>
          {/* Accent doc-info block */}
          <div
            style={{
              background: gradient,
              borderRadius: 4,
              padding: "8px 14px",
              minWidth: 180,
              printColorAdjust: "exact",
              WebkitPrintColorAdjust: "exact",
            } as React.CSSProperties}
          >
            {[
              { label: "Invoice No", value: data.documentNumber },
              { label: "Date", value: data.documentDate },
              ...(data.validUntil ? [{ label: "Due Date", value: data.validUntil }] : []),
            ].map((row) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "3px 0" }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.65)" }}>{row.label}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const continuationHeader = (pageNumber: number, totalPages: number) => (
    <div style={{ paddingTop: 14, paddingBottom: 12, borderBottom: "1px solid #e4e8f0", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 14, fontWeight: 800, color: "#111" }}>{data.businessName}</span>
      <DocumentPageMeta data={data} pageNumber={pageNumber} totalPages={totalPages} />
    </div>
  );

  // Gradient footer bar with contact-info style
  const footer = (
    <div
      data-template-footer="slate"
      style={{
        marginLeft: `calc(-1 * ${bleed})`,
        marginRight: `calc(-1 * ${bleed})`,
        background: gradient,
        padding: `10px ${bleed}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "auto",
        printColorAdjust: "exact",
        WebkitPrintColorAdjust: "exact",
      } as React.CSSProperties}
    >
      <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: 1, textTransform: "uppercase" }}>
        {data.businessName}
      </span>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        {data.businessAddress.split("\n").slice(0, 2).map((line, i) => (
          <span key={i} style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>{line}</span>
        ))}
      </div>
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
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
          {firstPageHeader("Received from")}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <GradientBottom data={data} compact={false} gradient={gradient} />
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
                {firstPageHeader(data.kind === "invoice" ? "Bill to" : "Prepared for")}
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
              <GradientLineItems data={data} items={page.lineItems} layoutMode={layoutMode} accent={accent} />
              {page.showTotals ? (
                <>
                  <GradientBottom data={data} compact={layoutMode === "compact"} gradient={gradient} />
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
