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

// Editorial / agency layout — vertical business name on left spine, wide content column right

function StudioLineItems({
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
  const cellPad = compact ? "10px 0" : "13px 0";

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ borderBottom: `2px solid ${accent}` }}>
          {["Description", "Qty", "Unit Price", "Amount"].map((col, i) => (
            <th
              key={col}
              style={{
                padding: compact ? "8px 0 8px 0" : "10px 0",
                paddingRight: i < 3 ? 16 : 0,
                textAlign: i === 0 ? "left" : "right",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#888",
              }}
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id} style={{ borderBottom: "1px solid #f0ede9" }}>
            <td style={{ padding: cellPad, paddingRight: 16, verticalAlign: "top", color: "#111", fontWeight: 600 }}>
              {item.description}
              {item.note ? (
                <div style={{ marginTop: 3, fontSize: 11, color: "#aaa", fontWeight: 400, lineHeight: 1.4 }}>
                  {item.note}
                </div>
              ) : null}
            </td>
            <td style={{ padding: cellPad, paddingRight: 16, textAlign: "right", color: "#888", fontVariantNumeric: "tabular-nums" }}>
              {formatLineItemQuantity(item)}
            </td>
            <td style={{ padding: cellPad, paddingRight: 16, textAlign: "right", color: "#888", fontVariantNumeric: "tabular-nums" }}>
              {formatCurrency(item.unitPrice, data.currency)}
            </td>
            <td style={{ padding: cellPad, textAlign: "right", color: "#111", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
              {formatCurrency(item.quantity * item.unitPrice, data.currency)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StudioTotals({ data, compact, accent }: { data: DocumentData; compact: boolean; accent: string }) {
  if (data.kind === "receipt") {
    return (
      <div style={{ marginTop: compact ? 14 : 20, textAlign: "right" }}>
        {data.paymentMethod ? (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#bbb", marginBottom: 4 }}>Payment method</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{data.paymentMethod}</div>
          </div>
        ) : null}
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#bbb", marginBottom: 4 }}>Amount received</div>
        <div style={{ fontSize: 36, fontWeight: 900, color: accent, letterSpacing: -1, fontVariantNumeric: "tabular-nums" }}>
          {formatCurrency(data.amountReceived, data.currency)}
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
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0ede9" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#aaa" }}>{row.label}</span>
            <span style={{ fontSize: 13, color: "#555", fontVariantNumeric: "tabular-nums" }}>{row.value}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "14px 0 0" }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: accent }}>Total</span>
          <span style={{ fontSize: 26, fontWeight: 900, color: "#111", fontVariantNumeric: "tabular-nums", letterSpacing: -1 }}>
            {formatCurrency(totals.total, data.currency)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function StudioTemplate({ data }: { data: DocumentData }) {
  const theme = getThemeById(data.themeId);
  const { accent } = theme;

  const bleed = "clamp(1.25rem, 2.8vw, 2.5rem)";

  // Thin accent top stripe
  const topStripe = (
    <div
      style={{
        height: 3,
        background: accent,
        marginLeft: `calc(-1 * ${bleed})`,
        marginRight: `calc(-1 * ${bleed})`,
        marginTop: `calc(-1 * ${bleed})`,
        printColorAdjust: "exact",
        WebkitPrintColorAdjust: "exact",
      }}
    />
  );

  const firstPageHeader = (fromLabel: string, toLabel: string) => (
    <>
      {topStripe}
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 28, paddingTop: 28, paddingBottom: 20, borderBottom: "1px solid #ede9e4" }}>
        {/* Left: rotated business name */}
        <div
          style={{
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            transform: "rotate(180deg)",
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: accent,
            lineHeight: 1,
            alignSelf: "start",
          }}
        >
          {data.businessName}
        </div>

        {/* Right: all content */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              {data.logoDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- printable document templates use runtime data URLs here
                <img src={data.logoDataUrl} alt="" style={{ height: 40, width: "auto", objectFit: "contain" }} />
              ) : (
                <div style={{ fontSize: 24, fontWeight: 900, color: "#111", letterSpacing: -0.75, lineHeight: 1 }}>
                  {data.businessName}
                </div>
              )}
              <div style={{ marginTop: 5, fontSize: 11, color: "#aaa", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                {data.businessAddress}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#bbb", marginBottom: 4 }}>{data.kind}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#111", letterSpacing: -0.5 }}>{data.documentNumber}</div>
              <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>{data.documentDate}</div>
              {data.validUntil ? (
                <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>Valid until {data.validUntil}</div>
              ) : null}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {[
              { label: fromLabel, name: data.businessName, address: data.businessAddress },
              { label: toLabel, name: data.customerName, address: data.customerAddress },
            ].map((p) => (
              <div key={p.label}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: accent, marginBottom: 5 }}>{p.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 2 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "#888", lineHeight: 1.65, whiteSpace: "pre-line" }}>{p.address}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const continuationHeader = (pageNumber: number, totalPages: number) => (
    <>
      {topStripe}
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 28, paddingTop: 20, paddingBottom: 16 }}>
        <div
          style={{
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            transform: "rotate(180deg)",
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: accent,
            lineHeight: 1,
            alignSelf: "start",
          }}
        >
          {data.businessName}
        </div>
        <div>
          <DocumentPageMeta data={data} pageNumber={pageNumber} totalPages={totalPages} />
        </div>
      </div>
    </>
  );

  const footer = (
    <div
      data-template-footer="studio"
      style={{
        marginLeft: `calc(-1 * ${bleed})`,
        marginRight: `calc(-1 * ${bleed})`,
        borderTop: "1px solid #ede9e4",
        padding: `12px ${bleed}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 700, color: "#bbb", letterSpacing: 1, textTransform: "uppercase" }}>
        {data.businessName}
      </span>
      <span style={{ fontSize: 10, color: "#ccc" }}>
        {data.kind} · {data.documentNumber}{data.validUntil ? ` · Valid until ${data.validUntil}` : ""}
      </span>
    </div>
  );

  const autoGeneratedNote = (
    <div style={{ marginTop: 18, fontSize: 12, color: "#aaa", lineHeight: 1.65 }}>
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
          <div style={{ flex: 1, display: "flex", flexDirection: "column", marginTop: 20 }}>
            <StudioTotals data={data} compact={false} accent={accent} />
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
                  <div style={{ marginTop: 14, marginBottom: 4 }}>
                    <DocumentPageMeta data={data} pageNumber={page.pageNumber} totalPages={page.totalPages} />
                  </div>
                ) : null}
              </>
            ) : (
              continuationHeader(page.pageNumber, page.totalPages)
            )}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", marginTop: page.isFirstPage ? 16 : 0 }}>
              <StudioLineItems data={data} items={page.lineItems} layoutMode={layoutMode} accent={accent} />
              {page.showTotals ? (
                <>
                  <StudioTotals data={data} compact={layoutMode === "compact"} accent={accent} />
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
