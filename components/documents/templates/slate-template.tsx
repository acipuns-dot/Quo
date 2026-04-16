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

// Two-tone split header — dark left column (business), white right column (doc info)
// Clean structured layout with subtle grid

function SlateLineItems({
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
  const cellV = compact ? "10px 14px" : "13px 16px";

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ background: "#f8f7f6" }}>
          {["Description", "Qty", "Unit Price", "Amount"].map((col, i) => (
            <th
              key={col}
              style={{
                padding: compact ? "8px 14px" : "10px 14px",
                textAlign: i === 0 ? "left" : "right",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#888",
                borderTop: `3px solid ${accent}`,
                borderBottom: "1px solid #e8e4e0",
              }}
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={item.id} style={{ background: index % 2 === 0 ? "#fff" : "#faf9f8" }}>
            <td style={{ padding: cellV, borderBottom: "1px solid #ede9e4", color: "#111", fontWeight: 500 }}>
              {item.description}
              {item.note ? (
                <div style={{ marginTop: 3, fontSize: 11, color: "#aaa", fontWeight: 400, lineHeight: 1.4 }}>
                  {item.note}
                </div>
              ) : null}
            </td>
            <td style={{ padding: cellV, borderBottom: "1px solid #ede9e4", textAlign: "right", color: "#888", fontVariantNumeric: "tabular-nums" }}>
              {formatLineItemQuantity(item)}
            </td>
            <td style={{ padding: cellV, borderBottom: "1px solid #ede9e4", textAlign: "right", color: "#888", fontVariantNumeric: "tabular-nums" }}>
              {formatCurrency(item.unitPrice, data.currency)}
            </td>
            <td style={{ padding: cellV, borderBottom: "1px solid #ede9e4", textAlign: "right", color: "#111", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
              {formatCurrency(item.quantity * item.unitPrice, data.currency)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SlateTotals({ data, compact, accent }: { data: DocumentData; compact: boolean; accent: string }) {
  if (data.kind === "receipt") {
    return (
      <div style={{ marginTop: compact ? 14 : 20, display: "flex", justifyContent: "flex-end" }}>
        <div
          style={{
            background: accent,
            borderRadius: 8,
            padding: compact ? "16px 24px" : "20px 28px",
            textAlign: "right",
            minWidth: 200,
            printColorAdjust: "exact",
            WebkitPrintColorAdjust: "exact",
          } as React.CSSProperties}
        >
          {data.paymentMethod ? (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>Payment method</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{data.paymentMethod}</div>
            </div>
          ) : null}
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>Amount received</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: -0.5, fontVariantNumeric: "tabular-nums" }}>
            {formatCurrency(data.amountReceived, data.currency)}
          </div>
        </div>
      </div>
    );
  }

  const totals = calculateDocumentTotals(data);
  const paymentTermSummary = getPaymentTermSummary(data);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: compact ? 14 : 24, alignItems: "start" }}>
      <div>
        {paymentTermSummary ? (
          <div style={{ marginBottom: data.notes ? 14 : 0 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#bbb", marginBottom: 6 }}>Payment terms</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111", lineHeight: 1.5 }}>{paymentTermSummary.label}</div>
            <div style={{ marginTop: 6, fontSize: 12, color: "#888", lineHeight: 1.6 }}>
              Amount due now: {formatCurrency(paymentTermSummary.amountDue, data.currency)}
            </div>
          </div>
        ) : null}
        {data.notes ? (
          <>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#bbb", marginBottom: 6 }}>Notes</div>
            <div style={{ fontSize: 12, color: "#555", lineHeight: 1.65, whiteSpace: "pre-line" }}>{data.notes}</div>
          </>
        ) : null}
      </div>

      <div>
        {[
          { label: "Subtotal", value: formatCurrency(totals.lineItemSubtotal, data.currency) },
          ...totals.additionalFees.map((f) => ({ label: f.label, value: formatCurrency(f.amount, data.currency) })),
          ...(data.applyTax ? [{ label: data.taxLabel, value: formatCurrency(totals.taxAmount, data.currency) }] : []),
        ].map((row) => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #ede9e4" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#bbb" }}>{row.label}</span>
            <span style={{ fontSize: 13, color: "#555", fontVariantNumeric: "tabular-nums" }}>{row.value}</span>
          </div>
        ))}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "13px 16px",
            marginTop: 8,
            background: accent,
            borderRadius: 6,
            printColorAdjust: "exact",
            WebkitPrintColorAdjust: "exact",
          } as React.CSSProperties}
        >
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.8)" }}>Total</span>
          <span style={{ fontSize: 20, fontWeight: 900, color: "#fff", fontVariantNumeric: "tabular-nums", letterSpacing: -0.5 }}>
            {formatCurrency(totals.total, data.currency)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function SlateTemplate({ data }: { data: DocumentData }) {
  const theme = getThemeById(data.themeId);
  const { accent, dark } = theme;

  const bleed = "clamp(1.25rem, 2.8vw, 2.5rem)";

  // Split header: dark left half, white right half
  const firstPageHeader = (fromLabel: string, toLabel: string) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        marginLeft: `calc(-1 * ${bleed})`,
        marginRight: `calc(-1 * ${bleed})`,
        marginTop: `calc(-1 * ${bleed})`,
        marginBottom: 24,
        minHeight: 140,
      }}
    >
      {/* Dark left: business info */}
      <div
        style={{
          background: dark,
          padding: `28px ${bleed} 24px`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          printColorAdjust: "exact",
          WebkitPrintColorAdjust: "exact",
        } as React.CSSProperties}
      >
        <div>
          {data.logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- printable document templates use runtime data URLs here
            <img src={data.logoDataUrl} alt="" style={{ height: 36, width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)", marginBottom: 10 }} />
          ) : (
            <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: -0.5, lineHeight: 1.1, marginBottom: 10 }}>
              {data.businessName}
            </div>
          )}
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, whiteSpace: "pre-line" }}>
            {data.businessAddress}
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: accent, marginBottom: 3 }}>{fromLabel}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{data.businessName}</div>
        </div>
      </div>

      {/* Light right: doc details + customer */}
      <div
        style={{
          background: "#f8f7f6",
          padding: `28px ${bleed} 24px`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderBottom: `3px solid ${accent}`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#bbb", marginBottom: 4 }}>Document</div>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "3px", textTransform: "uppercase", color: accent }}>{data.kind}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#111", letterSpacing: -0.5 }}>{data.documentNumber}</div>
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 3 }}>{data.documentDate}</div>
            {data.validUntil ? (
              <div style={{ fontSize: 11, color: "#aaa", marginTop: 1 }}>Valid until {data.validUntil}</div>
            ) : null}
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: accent, marginBottom: 3 }}>{toLabel}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 2 }}>{data.customerName}</div>
          <div style={{ fontSize: 11, color: "#888", lineHeight: 1.6, whiteSpace: "pre-line" }}>{data.customerAddress}</div>
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
        marginBottom: 16,
        background: dark,
        padding: `16px ${bleed}`,
        printColorAdjust: "exact",
        WebkitPrintColorAdjust: "exact",
      } as React.CSSProperties}
    >
      <DocumentPageMeta
        data={data}
        pageNumber={pageNumber}
        totalPages={totalPages}
      />
    </div>
  );

  const footer = (
    <div
      data-template-footer="slate"
      style={{
        marginLeft: `calc(-1 * ${bleed})`,
        marginRight: `calc(-1 * ${bleed})`,
        borderTop: `3px solid ${accent}`,
        padding: `11px ${bleed}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        printColorAdjust: "exact",
        WebkitPrintColorAdjust: "exact",
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 700, color: "#333", letterSpacing: 1, textTransform: "uppercase" }}>
        {data.businessName}
      </span>
      <span style={{ fontSize: 10, color: "#ccc" }}>
        {data.kind} · {data.documentNumber}{data.validUntil ? ` · Valid until ${data.validUntil}` : ""}
      </span>
    </div>
  );

  const autoGeneratedNote = (
    <div style={{ marginTop: 18, fontSize: 12, color: "#bbb", lineHeight: 1.65 }}>
      This is an auto-generated document. No signature required.
    </div>
  );

  const notesSection = (layoutMode: DocumentLayoutMode) =>
    data.notes ? (
      <div style={{ marginTop: layoutMode === "compact" ? 12 : 18 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#bbb", marginBottom: 6 }}>Notes</div>
        <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6, whiteSpace: "pre-line" }}>{data.notes}</div>
      </div>
    ) : null;

  if (data.kind === "receipt") {
    return (
      <DocumentShell accentClass="">
        <div style={{ fontFamily: FONT, display: "flex", flexDirection: "column", flex: 1 }}>
          {firstPageHeader("Issued by", "Received from")}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <SlateTotals data={data} compact={false} accent={accent} />
            {notesSection("comfortable")}
            {autoGeneratedNote}
          </div>
        </div>
        {footer}
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
                {firstPageHeader(data.kind === "invoice" ? "From" : "Prepared by", data.kind === "invoice" ? "Bill to" : "Prepared for")}
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
              <SlateLineItems data={data} items={page.lineItems} layoutMode={layoutMode} accent={accent} />
              {page.showTotals ? (
                <>
                  <SlateTotals data={data} compact={layoutMode === "compact"} accent={accent} />
                  {autoGeneratedNote}
                </>
              ) : null}
              {page.showNotes ? notesSection(layoutMode) : null}
            </div>
          </div>
          {page.isFinalPage ? footer : null}
        </DocumentShell>
      )}
    />
  );
}
