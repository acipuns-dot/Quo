import React from "react";
import { getThemeById } from "../../../lib/documents/templates";
import { calculateDocumentTotals, getPaymentTermSummary } from "../../../lib/documents/calculations";
import { formatCurrency } from "../../../lib/documents/format";
import type { DocumentData, DocumentLayoutMode, LineItem } from "../../../lib/documents/types";
import { DocumentPageMeta } from "../document-page-meta";
import { DocumentPaginatedLayout } from "../document-paginated-layout";
import { DocumentShell } from "../document-shell";

const FONT = "'DM Sans', system-ui, sans-serif";

// ─── helpers ─────────────────────────────────────────────────────────────────

function lbl(color: string) {
  return {
    fontSize: 9,
    fontWeight: 700 as const,
    letterSpacing: "2px",
    textTransform: "uppercase" as const,
    color,
  };
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ─── line items table ─────────────────────────────────────────────────────────

function ClassicLineItems({
  data,
  items,
  layoutMode,
  accent,
  indexOffset = 0,
}: {
  data: DocumentData;
  items: LineItem[];
  layoutMode: DocumentLayoutMode;
  accent: string;
  indexOffset?: number;
}) {
  if (data.kind === "receipt") return null;

  const compact = layoutMode === "compact";
  const cellV = compact ? "10px 14px" : "13px 16px";
  const rowTint = hexToRgba(accent, 0.05);

  return (
    <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 13 }}>
      <thead>
        <tr style={{ background: accent, printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" } as React.CSSProperties}>
          {["Item / Description", "Qty.", "Rate", "Amount"].map((col, i) => (
            <th
              key={col}
              style={{
                padding: compact ? "10px 14px" : "12px 16px",
                textAlign: i === 0 ? "left" : "right",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#fff",
                borderRadius: i === 0 ? "6px 0 0 6px" : i === 3 ? "0 6px 6px 0" : undefined,
              }}
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={item.id} style={{ background: index % 2 === 0 ? "#fff" : rowTint }}>
            <td style={{ padding: cellV, borderBottom: "1px solid #f0ede9", verticalAlign: "top", color: "#111", fontWeight: 600 }}>
              {indexOffset + index + 1}.{"\u00a0\u00a0"}{item.description}
              {item.note ? (
                <div style={{ marginTop: 4, fontSize: 11, color: "#999", fontWeight: 400, lineHeight: 1.5 }}>
                  {item.note}
                </div>
              ) : null}
            </td>
            <td style={{ padding: cellV, borderBottom: "1px solid #f0ede9", textAlign: "right", color: "#555", fontVariantNumeric: "tabular-nums" }}>
              {item.quantity}
            </td>
            <td style={{ padding: cellV, borderBottom: "1px solid #f0ede9", textAlign: "right", color: "#555", fontVariantNumeric: "tabular-nums" }}>
              {formatCurrency(item.unitPrice, data.currency)}
            </td>
            <td style={{ padding: cellV, borderBottom: "1px solid #f0ede9", textAlign: "right", color: "#111", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
              {formatCurrency(item.quantity * item.unitPrice, data.currency)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── totals ───────────────────────────────────────────────────────────────────

function ClassicTotals({ data, compact, accent }: { data: DocumentData; compact: boolean; accent: string }) {
  if (data.kind === "receipt") {
    return (
      <div style={{ textAlign: "right", padding: compact ? "16px 20px" : "20px 24px", border: "1px solid #ede9e4", borderRadius: 8 }}>
        {data.paymentMethod ? (
          <div style={{ marginBottom: 12 }}>
            <div style={lbl("#aaa")}>Payment method</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#111", marginTop: 4 }}>{data.paymentMethod}</div>
          </div>
        ) : null}
        <div style={lbl("#aaa")}>Amount received</div>
        <div style={{ fontSize: 32, fontWeight: 700, color: "#111", marginTop: 4, letterSpacing: -1 }}>
          {formatCurrency(data.amountReceived, data.currency)}
        </div>
      </div>
    );
  }

  const totals = calculateDocumentTotals(data);
  const paymentTermSummary = getPaymentTermSummary(data);
  return (
    <div style={{ marginLeft: "auto", width: "100%", maxWidth: 300 }}>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #f0ede9", color: "#888", fontSize: 13 }}>
        <span style={{ textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 11 }}>Sub Total</span>
        <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatCurrency(totals.subtotal, data.currency)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #f0ede9", color: "#888", fontSize: 13 }}>
        <span style={{ textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 11 }}>{data.taxLabel}</span>
        <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatCurrency(totals.taxAmount, data.currency)}</span>
      </div>
      {paymentTermSummary ? (
        <div style={{ padding: "12px 0", borderBottom: "1px solid #f0ede9" }}>
          <div style={{ textTransform: "uppercase", letterSpacing: "0.14em", fontSize: 11, fontWeight: 700, color: "#888" }}>Payment terms</div>
          <div style={{ marginTop: 6, fontSize: 14, fontWeight: 700, color: "#111" }}>{paymentTermSummary.label}</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, color: "#888", fontSize: 13 }}>
            <span style={{ textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 11 }}>Amount due now</span>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatCurrency(paymentTermSummary.amountDue, data.currency)}</span>
          </div>
        </div>
      ) : null}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderTop: `2px solid ${accent}` }}>
        <span style={{ textTransform: "uppercase", letterSpacing: "0.14em", fontSize: 13, fontWeight: 700, color: "#111" }}>Total</span>
        <span style={{ fontSize: 26, fontWeight: 800, color: "#111", fontVariantNumeric: "tabular-nums", letterSpacing: -0.5 }}>
          {formatCurrency(totals.total, data.currency)}
        </span>
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export function ClassicTemplate({ data }: { data: DocumentData }) {
  const theme = getThemeById(data.themeId);
  const { accent } = theme;
  const partyTint = hexToRgba(accent, 0.07);

  const bleed = "clamp(1.25rem, 2.8vw, 2.5rem)";

  // Centered document kind title
  const titleBar = (
    <div style={{ textAlign: "center", paddingTop: 8, paddingBottom: 20 }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: accent, letterSpacing: -0.3, textTransform: "capitalize" }}>
        {data.kind.charAt(0).toUpperCase() + data.kind.slice(1)}
      </div>
    </div>
  );

  // Logo/name left, doc number/date right — plain white, no background
  const topRow = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
      <div>
        {data.logoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- printable document templates use runtime data URLs here
          <img src={data.logoDataUrl} alt="" style={{ height: 44, width: "auto", objectFit: "contain", marginBottom: 6 }} />
        ) : (
          <div style={{ fontSize: 22, fontWeight: 900, color: "#111", letterSpacing: -0.5, lineHeight: 1.2 }}>
            {data.businessName}
          </div>
        )}
      </div>
      <div
        style={{
          width: 180,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: "#999" }}>{data.kind.charAt(0).toUpperCase() + data.kind.slice(1)}#</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#111" }}>{data.documentNumber}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: "#999" }}>{data.kind === "invoice" ? "Invoice Date" : data.kind === "receipt" ? "Date" : "Quotation Date"}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#111", textTransform: "uppercase" as const, letterSpacing: 0.5 }}>{data.documentDate}</span>
        </div>
        {data.validUntil ? (
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 6 }}>
            <span style={{ fontSize: 12, color: "#999" }}>Valid Until</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#111", textTransform: "uppercase" as const, letterSpacing: 0.5 }}>{data.validUntil}</span>
          </div>
        ) : null}
      </div>
    </div>
  );

  // Two tinted boxes side by side for parties
  const parties = (fromLabel: string, toLabel: string) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
      {[
        { label: fromLabel, name: data.businessName, address: data.businessAddress },
        { label: toLabel, name: data.customerName, address: data.customerAddress },
      ].map((party) => (
        <div
          key={party.label}
          style={{ background: partyTint, borderRadius: 8, padding: "16px 18px" }}
        >
          <div style={{ ...lbl(accent), marginBottom: 8 }}>{party.label}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 4 }}>{party.name}</div>
          <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6, whiteSpace: "pre-line" }}>{party.address}</div>
        </div>
      ))}
    </div>
  );

  const notesAndNotice = (layoutMode: DocumentLayoutMode) => (
    <div style={{ marginTop: layoutMode === "compact" ? 14 : 20, paddingTop: 16, borderTop: "1px solid #ede9e4" }}>
      {data.notes ? (
        <div style={{ marginBottom: 12 }}>
          <div style={{ ...lbl(accent), marginBottom: 6 }}>Notes</div>
          <div style={{ fontSize: 12, color: "#555", lineHeight: layoutMode === "compact" ? 1.5 : 1.65, whiteSpace: "pre-line" }}>
            {data.notes}
          </div>
        </div>
      ) : null}
      <div style={{ fontSize: 12, color: "#aaa", lineHeight: layoutMode === "compact" ? 1.5 : 1.65 }}>
        This is an auto-generated document. No signature required.
      </div>
    </div>
  );

  const footer = (
    <div
      data-template-footer="classic"
      style={{
        marginLeft: `calc(-1 * ${bleed})`,
        marginRight: `calc(-1 * ${bleed})`,
        marginTop: "auto",
        borderTop: `1px dashed ${accent}`,
        background: hexToRgba(accent, 0.04),
        padding: `12px ${bleed}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        printColorAdjust: "exact",
        WebkitPrintColorAdjust: "exact",
      } as React.CSSProperties}
    >
      <span
        style={{
          flex: 1,
          minWidth: 0,
          marginRight: 12,
          fontSize: 11,
          fontWeight: 700,
          color: accent,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        {data.businessName}
      </span>
      <span style={{ flexShrink: 0, fontSize: 10, color: "#bbb", letterSpacing: 0.5 }}>
        {data.kind} · {data.documentNumber}{data.validUntil ? ` · Valid until ${data.validUntil}` : ""}
      </span>
    </div>
  );

  // Header = titleBar + topRow + parties
  const renderFirstPageHeader = (fromLabel: string, toLabel: string) => (
    <>
      {titleBar}
      {topRow}
      {parties(fromLabel, toLabel)}
    </>
  );

  const renderContinuationHeader = (pageNumber: number, totalPages: number) => (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, paddingBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: accent, letterSpacing: -0.3, textTransform: "capitalize" }}>
          {data.kind.charAt(0).toUpperCase() + data.kind.slice(1)}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#111", letterSpacing: 0.5 }}>
          {data.documentNumber}
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <DocumentPageMeta
          data={data}
          pageNumber={pageNumber}
          totalPages={totalPages}
        />
      </div>
    </>
  );

  if (data.kind === "receipt") {
    return (
      <DocumentShell accentClass="">
        <div style={{ fontFamily: FONT, display: "flex", flexDirection: "column", flex: 1 }}>
          {renderFirstPageHeader("Issued by", "Received from")}
          <div style={{ flex: 1 }}>
            <ClassicTotals data={data} compact={false} accent={accent} />
            {notesAndNotice("comfortable")}
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
                {renderFirstPageHeader("Quotation by", data.kind === "invoice" ? "Bill to" : "Quotation to")}
                {page.totalPages > 1 ? (
                  <div style={{ marginBottom: 16 }}>
                    <DocumentPageMeta
                      data={data}
                      pageNumber={page.pageNumber}
                      totalPages={page.totalPages}
                    />
                  </div>
                ) : null}
              </>
            ) : (
              renderContinuationHeader(page.pageNumber, page.totalPages)
            )}
            <div style={{ flex: 1 }}>
              <ClassicLineItems data={data} items={page.lineItems} layoutMode={layoutMode} accent={accent} indexOffset={data.lineItems.indexOf(page.lineItems[0]!)} />
              {page.showTotals ? (
                <div style={{ marginTop: layoutMode === "compact" ? 12 : 20 }}>
                  <ClassicTotals data={data} compact={layoutMode === "compact"} accent={accent} />
                </div>
              ) : null}
              {page.showNotes ? notesAndNotice(layoutMode) : null}
            </div>
            {footer}
          </div>
        </DocumentShell>
      )}
    />
  );
}
