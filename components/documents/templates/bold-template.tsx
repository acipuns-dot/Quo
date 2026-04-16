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



// ─── line items table ─────────────────────────────────────────────────────────

function BoldLineItems({
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
        <tr style={{ background: "#f5f5f5" }}>
          {["Qty", "Description", "Price", "Amount"].map((col, i) => (
            <th
              key={col}
              style={{
                padding: compact ? "9px 12px" : "11px 14px",
                textAlign: i === 0 ? "center" : i === 1 ? "left" : "right",
                fontSize: 11,
                fontWeight: 700,
                color: "#333",
                border: "1px solid #ddd",
                borderBottom: `2px solid ${accent}`,
                background: "#f5f5f5",
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
            <td style={{ padding: cellV, border: "1px solid #ddd", textAlign: "center", color: "#555", fontVariantNumeric: "tabular-nums", width: "8%" }}>
              {formatLineItemQuantity(item)}
            </td>
            <td style={{ padding: cellV, border: "1px solid #ddd", color: "#111", fontWeight: 500 }}>
              {item.description}
              {item.note ? (
                <div style={{ marginTop: 3, fontSize: 11, color: "#999", fontWeight: 400, lineHeight: 1.4 }}>
                  {item.note}
                </div>
              ) : null}
            </td>
            <td style={{ padding: cellV, border: "1px solid #ddd", textAlign: "right", color: "#555", fontVariantNumeric: "tabular-nums" }}>
              {formatCurrency(item.unitPrice, data.currency)}
            </td>
            <td style={{ padding: cellV, border: "1px solid #ddd", textAlign: "right", color: "#111", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
              {formatCurrency(item.quantity * item.unitPrice, data.currency)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── bottom section: payment left, totals right ───────────────────────────────

function BoldBottom({
  data,
  compact,
  accent,
}: {
  data: DocumentData;
  compact: boolean;
  accent: string;
}) {
  if (data.kind === "receipt") {
    return (
      <div style={{ border: "1px solid #ddd", borderRadius: 4, padding: compact ? "14px 16px" : "18px 20px", textAlign: "right", marginTop: compact ? 14 : 20 }}>
        {data.paymentMethod ? (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#aaa", marginBottom: 4 }}>Payment method</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{data.paymentMethod}</div>
          </div>
        ) : null}
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#aaa", marginBottom: 4 }}>Amount received</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#111", letterSpacing: -0.5 }}>
          {formatCurrency(data.amountReceived, data.currency)}
        </div>
      </div>
    );
  }

  const totals = calculateDocumentTotals(data);
  const paymentTermSummary = getPaymentTermSummary(data);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: compact ? 14 : 24, alignItems: "start" }}>
      {/* Payment / notes left */}
      <div>
        {paymentTermSummary ? (
          <div style={{ marginBottom: data.notes ? 14 : 0 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#aaa", marginBottom: 6 }}>Payment terms</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111", lineHeight: 1.5 }}>{paymentTermSummary.label}</div>
            <div style={{ marginTop: 6, fontSize: 12, color: "#555", lineHeight: 1.6 }}>
              Amount due now: {formatCurrency(paymentTermSummary.amountDue, data.currency)}
            </div>
          </div>
        ) : null}
        {data.notes ? (
          <>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#aaa", marginBottom: 6 }}>Notes</div>
            <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6, whiteSpace: "pre-line" }}>{data.notes}</div>
          </>
        ) : null}
      </div>

      {/* Totals right — bordered box */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <tbody>
          <tr>
            <td style={{ padding: "9px 14px", border: "1px solid #ddd", fontWeight: 600, color: "#333", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.06em" }}>Subtotal</td>
            <td style={{ padding: "9px 14px", border: "1px solid #ddd", textAlign: "right", fontVariantNumeric: "tabular-nums", color: "#333" }}>
              {formatCurrency(totals.subtotal, data.currency)}
            </td>
          </tr>
          {data.applyTax ? (
            <tr>
              <td style={{ padding: "9px 14px", border: "1px solid #ddd", fontWeight: 600, color: "#333", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.06em" }}>{data.taxLabel}</td>
              <td style={{ padding: "9px 14px", border: "1px solid #ddd", textAlign: "right", fontVariantNumeric: "tabular-nums", color: "#333" }}>
                {formatCurrency(totals.taxAmount, data.currency)}
              </td>
            </tr>
          ) : null}
          <tr style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" } as React.CSSProperties}>
            <td style={{ padding: "11px 14px", border: "1px solid #ddd", fontWeight: 700, color: "#fff", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.08em", background: accent, printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" } as React.CSSProperties}>
              Total Price
            </td>
            <td style={{ padding: "11px 14px", border: "1px solid #ddd", textAlign: "right", fontWeight: 800, fontSize: 16, fontVariantNumeric: "tabular-nums", color: "#fff", background: accent, printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" } as React.CSSProperties}>
              {formatCurrency(totals.total, data.currency)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export function BoldTemplate({ data }: { data: DocumentData }) {
  const theme = getThemeById(data.themeId);
  const { accent } = theme;

  const bleed = "clamp(1.25rem, 2.8vw, 2.5rem)";

  // Branding header: logo/name left, business contact right, accent bottom border
  const brandingHeader = (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingBottom: 16,
        marginBottom: 16,
        borderBottom: `2px solid ${accent}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {data.logoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- printable document templates use runtime data URLs here
          <img src={data.logoDataUrl} alt="" style={{ height: 48, width: "auto", objectFit: "contain" }} />
        ) : (
          <div style={{ fontSize: 20, fontWeight: 900, color: "#111", letterSpacing: -0.5, lineHeight: 1.2 }}>
            {data.businessName}
          </div>
        )}
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 4 }}>{data.businessName}</div>
        <div style={{ fontSize: 11, color: "#777", lineHeight: 1.8 }}>
          {data.businessAddress.split("\n").map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      </div>
    </div>
  );

  // Large centered document kind title
  const titleBar = (
    <div style={{ textAlign: "center", padding: "14px 0 18px" }}>
      <div style={{ fontSize: 30, fontWeight: 800, color: accent, letterSpacing: 1, textTransform: "uppercase" }}>
        {data.kind.charAt(0).toUpperCase() + data.kind.slice(1)}
      </div>
    </div>
  );

  // Doc meta: left col has doc number + date + valid until, right col has customer
  const topMeta = (billToLabel: string) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20, fontSize: 12 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div><span style={{ color: "#999" }}>No: </span><span style={{ fontWeight: 700, color: "#111" }}>{data.documentNumber}</span></div>
        <div><span style={{ color: "#999" }}>Date: </span><span style={{ fontWeight: 600, color: "#111" }}>{data.documentDate}</span></div>
        {data.validUntil ? (
          <div><span style={{ color: "#999" }}>Valid Until: </span><span style={{ fontWeight: 600, color: "#111" }}>{data.validUntil}</span></div>
        ) : null}
      </div>
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#999", marginBottom: 4 }}>To</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 2 }}>{data.customerName}</div>
        <div style={{ fontSize: 12, color: "#777", lineHeight: 1.6, whiteSpace: "pre-line" }}>{data.customerAddress}</div>
      </div>
    </div>
  );

  // Footer: accent band with business name left, doc info right
  const businessFooter = (
    <div
      data-template-footer="bold"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: `12px ${bleed}`,
        marginLeft: `calc(-1 * ${bleed})`,
        marginRight: `calc(-1 * ${bleed})`,
        background: accent,
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 800, color: "#fff", letterSpacing: 1.5, textTransform: "uppercase" }}>
        {data.businessName}
      </span>
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", letterSpacing: 0.5 }}>
        {data.kind} · {data.documentNumber}{data.validUntil ? ` · Valid until ${data.validUntil}` : ""}
      </span>
    </div>
  );

  const notesSection = (layoutMode: DocumentLayoutMode) => (
    data.notes ? (
      <div style={{ marginTop: layoutMode === "compact" ? 12 : 18 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#aaa", marginBottom: 6 }}>Notes</div>
        <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6, whiteSpace: "pre-line" }}>{data.notes}</div>
      </div>
    ) : null
  );

  if (data.kind === "receipt") {
    return (
      <DocumentShell accentClass="">
        <div style={{ fontFamily: FONT, display: "flex", flexDirection: "column", flex: 1 }}>
          {brandingHeader}
          {titleBar}
          {topMeta("Received from")}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <BoldBottom data={data} compact={false} accent={accent} />
            {notesSection("comfortable")}
          </div>
        </div>
        {businessFooter}
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
                {brandingHeader}
                {titleBar}
                {topMeta(data.kind === "invoice" ? "Bill to" : "Prepared for")}
                {page.totalPages > 1 ? (
                  <DocumentPageMeta data={data} pageNumber={page.pageNumber} totalPages={page.totalPages} />
                ) : null}
              </>
            ) : (
              <div style={{ marginBottom: 12 }}>
                <DocumentPageMeta data={data} pageNumber={page.pageNumber} totalPages={page.totalPages} />
              </div>
            )}
            <div style={{ flex: 1, marginTop: page.isFirstPage ? 8 : 0, display: "flex", flexDirection: "column" }}>
              <BoldLineItems data={data} items={page.lineItems} layoutMode={layoutMode} accent={accent} />
              {page.showTotals ? (
                <BoldBottom data={data} compact={layoutMode === "compact"} accent={accent} />
              ) : null}
            </div>
          </div>
          {page.isFinalPage ? businessFooter : null}
        </DocumentShell>
      )}
    />
  );
}
