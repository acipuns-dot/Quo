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

// Geometric accent cut across top-right corner, bold total callout, clean white layout

function PulseLineItems({
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
        <tr>
          {["Description", "Qty", "Unit Price", "Amount"].map((col, i) => (
            <th
              key={col}
              style={{
                padding: compact ? "9px 14px" : "11px 14px",
                textAlign: i === 0 ? "left" : "right",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#fff",
                background: accent,
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

function PulseTotals({ data, compact, accent }: { data: DocumentData; compact: boolean; accent: string }) {
  if (data.kind === "receipt") {
    return (
      <div style={{ marginTop: compact ? 14 : 20, display: "flex", justifyContent: "flex-end" }}>
        <div style={{ textAlign: "right" }}>
          {data.paymentMethod ? (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#bbb", marginBottom: 4 }}>Payment method</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{data.paymentMethod}</div>
            </div>
          ) : null}
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#bbb", marginBottom: 6 }}>Amount received</div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              background: accent,
              borderRadius: 8,
              padding: "12px 20px",
              printColorAdjust: "exact",
              WebkitPrintColorAdjust: "exact",
            } as React.CSSProperties}
          >
            <span style={{ fontSize: 30, fontWeight: 900, color: "#fff", letterSpacing: -0.5, fontVariantNumeric: "tabular-nums" }}>
              {formatCurrency(data.amountReceived, data.currency)}
            </span>
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
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #ede9e4" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#bbb" }}>{row.label}</span>
            <span style={{ fontSize: 13, color: "#555", fontVariantNumeric: "tabular-nums" }}>{row.value}</span>
          </div>
        ))}
        {/* Large accent total callout */}
        <div
          style={{
            marginTop: 10,
            background: accent,
            borderRadius: 8,
            padding: "16px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            printColorAdjust: "exact",
            WebkitPrintColorAdjust: "exact",
          } as React.CSSProperties}
        >
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.75)" }}>Total due</span>
          <span style={{ fontSize: 22, fontWeight: 900, color: "#fff", fontVariantNumeric: "tabular-nums", letterSpacing: -0.5 }}>
            {formatCurrency(totals.total, data.currency)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function PulseTemplate({ data }: { data: DocumentData }) {
  const theme = getThemeById(data.themeId);
  const { accent } = theme;

  const bleed = "clamp(1.25rem, 2.8vw, 2.5rem)";

  // Geometric corner accent — diagonal cut into top-right
  const cornerCut = (
    <svg
      style={{ position: "absolute", top: 0, right: 0, width: 120, height: 120, display: "block" }}
      viewBox="0 0 120 120"
      fill="none"
    >
      <polygon points="120,0 120,120 0,0" fill={accent} opacity="0.12" />
      <polygon points="120,0 120,72 48,0" fill={accent} opacity="0.4" />
      <polygon points="120,0 120,36 84,0" fill={accent} />
    </svg>
  );

  const firstPageHeader = (fromLabel: string, toLabel: string) => (
    <div
      style={{
        position: "relative",
        marginLeft: `calc(-1 * ${bleed})`,
        marginRight: `calc(-1 * ${bleed})`,
        marginTop: `calc(-1 * ${bleed})`,
        padding: `28px ${bleed} 24px`,
        borderBottom: "1px solid #ede9e4",
        marginBottom: 20,
        overflow: "hidden",
        background: "#fff",
      }}
    >
      {cornerCut}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
        <div>
          {data.logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- printable document templates use runtime data URLs here
            <img src={data.logoDataUrl} alt="" style={{ height: 44, width: "auto", objectFit: "contain", marginBottom: 8 }} />
          ) : (
            <div style={{ fontSize: 22, fontWeight: 900, color: "#111", letterSpacing: -0.75, lineHeight: 1.1, marginBottom: 6 }}>
              {data.businessName}
            </div>
          )}
          <div style={{ fontSize: 10, color: "#aaa", lineHeight: 1.7, whiteSpace: "pre-line" }}>
            {data.businessAddress}
          </div>
        </div>
        <div style={{ textAlign: "right", paddingRight: 10 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: 4 }}>{data.kind}</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#111", letterSpacing: -0.5 }}>{data.documentNumber}</div>
          <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>{data.documentDate}</div>
          {data.validUntil ? (
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>Valid until {data.validUntil}</div>
          ) : null}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20, position: "relative" }}>
        {[
          { label: fromLabel, name: data.businessName, address: data.businessAddress },
          { label: toLabel, name: data.customerName, address: data.customerAddress },
        ].map((p) => (
          <div key={p.label} style={{ paddingLeft: 10, borderLeft: `2px solid ${accent}` }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: accent, marginBottom: 4 }}>{p.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 2 }}>{p.name}</div>
            <div style={{ fontSize: 11, color: "#888", lineHeight: 1.6, whiteSpace: "pre-line" }}>{p.address}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const continuationHeader = (pageNumber: number, totalPages: number) => (
    <div style={{ paddingTop: 16, marginBottom: 12 }}>
      <DocumentPageMeta data={data} pageNumber={pageNumber} totalPages={totalPages} />
    </div>
  );

  const footer = (
    <div
      data-template-footer="pulse"
      style={{
        marginLeft: `calc(-1 * ${bleed})`,
        marginRight: `calc(-1 * ${bleed})`,
        padding: `11px ${bleed}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: accent,
        printColorAdjust: "exact",
        WebkitPrintColorAdjust: "exact",
      } as React.CSSProperties}
    >
      <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.9)", letterSpacing: 1.5, textTransform: "uppercase" }}>
        {data.businessName}
      </span>
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
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
            <PulseTotals data={data} compact={false} accent={accent} />
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
              <PulseLineItems data={data} items={page.lineItems} layoutMode={layoutMode} accent={accent} />
              {page.showTotals ? (
                <>
                  <PulseTotals data={data} compact={layoutMode === "compact"} accent={accent} />
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
