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

// Full dark luxury theme — deep background, white type, accent color highlights

function NoirLineItems({
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
                color: accent,
                borderBottom: `1px solid rgba(255,255,255,0.12)`,
                background: "transparent",
              }}
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr
            key={item.id}
            style={{ background: index % 2 === 0 ? "rgba(255,255,255,0.025)" : "transparent" }}
          >
            <td style={{ padding: cellV, borderBottom: "1px solid rgba(255,255,255,0.06)", color: "#fff", fontWeight: 500 }}>
              {item.description}
              {item.note ? (
                <div style={{ marginTop: 3, fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 400, lineHeight: 1.4 }}>
                  {item.note}
                </div>
              ) : null}
            </td>
            <td style={{ padding: cellV, borderBottom: "1px solid rgba(255,255,255,0.06)", textAlign: "right", color: "rgba(255,255,255,0.55)", fontVariantNumeric: "tabular-nums" }}>
              {formatLineItemQuantity(item)}
            </td>
            <td style={{ padding: cellV, borderBottom: "1px solid rgba(255,255,255,0.06)", textAlign: "right", color: "rgba(255,255,255,0.55)", fontVariantNumeric: "tabular-nums" }}>
              {formatCurrency(item.unitPrice, data.currency)}
            </td>
            <td style={{ padding: cellV, borderBottom: "1px solid rgba(255,255,255,0.06)", textAlign: "right", color: "#fff", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
              {formatCurrency(item.quantity * item.unitPrice, data.currency)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function NoirTotals({ data, compact, accent }: { data: DocumentData; compact: boolean; accent: string }) {
  if (data.kind === "receipt") {
    return (
      <div style={{ marginTop: compact ? 14 : 20, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: compact ? "14px 18px" : "20px 24px", textAlign: "right" }}>
        {data.paymentMethod ? (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>Payment method</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{data.paymentMethod}</div>
          </div>
        ) : null}
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>Amount received</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: accent, letterSpacing: -0.5, fontVariantNumeric: "tabular-nums" }}>
          {formatCurrency(data.amountReceived, data.currency)}
        </div>
      </div>
    );
  }

  const totals = calculateDocumentTotals(data);
  const paymentTermSummary = getPaymentTermSummary(data);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: compact ? 14 : 20, alignItems: "start" }}>
      <div>
        {paymentTermSummary ? (
          <div style={{ marginBottom: data.notes ? 14 : 0 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>Payment terms</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1.5 }}>{paymentTermSummary.label}</div>
            <div style={{ marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
              Amount due now: {formatCurrency(paymentTermSummary.amountDue, data.currency)}
            </div>
          </div>
        ) : null}
        {data.notes ? (
          <>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>Notes</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{data.notes}</div>
          </>
        ) : null}
      </div>

      <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, overflow: "hidden" }}>
        {[
          { label: "Subtotal", value: formatCurrency(totals.lineItemSubtotal, data.currency), muted: true },
          ...totals.additionalFees.map((f) => ({ label: f.label, value: formatCurrency(f.amount, data.currency), muted: true })),
          ...(data.applyTax ? [{ label: data.taxLabel, value: formatCurrency(totals.taxAmount, data.currency), muted: true }] : []),
        ].map((row) => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 14px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>{row.label}</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontVariantNumeric: "tabular-nums" }}>{row.value}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 14px", background: accent, printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" } as React.CSSProperties}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff" }}>Total</span>
          <span style={{ fontSize: 18, fontWeight: 900, color: "#fff", fontVariantNumeric: "tabular-nums", letterSpacing: -0.5 }}>
            {formatCurrency(totals.total, data.currency)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function NoirTemplate({ data }: { data: DocumentData }) {
  const theme = getThemeById(data.themeId);
  const { accent, dark } = theme;

  const bg = dark;

  const header = (
    <div
      style={{
        paddingBottom: 24,
        borderBottom: `1px solid rgba(255,255,255,0.08)`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          {data.logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- printable document templates use runtime data URLs here
            <img src={data.logoDataUrl} alt="" style={{ height: 44, width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
          ) : (
            <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: -0.5, lineHeight: 1.1 }}>
              {data.businessName}
            </div>
          )}
          <div style={{ marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, whiteSpace: "pre-line" }}>
            {data.businessAddress}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              display: "inline-block",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: accent,
              marginBottom: 10,
            }}
          >
            {data.kind}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>
            {data.documentNumber}
          </div>
          <div style={{ marginTop: 4, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{data.documentDate}</div>
          {data.validUntil ? (
            <div style={{ marginTop: 2, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Valid until {data.validUntil}</div>
          ) : null}
        </div>
      </div>
    </div>
  );

  const parties = (fromLabel: string, toLabel: string) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, padding: "20px 0", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 20 }}>
      {[
        { label: fromLabel, name: data.businessName, address: data.businessAddress },
        { label: toLabel, name: data.customerName, address: data.customerAddress },
      ].map((p) => (
        <div key={p.label}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: accent, marginBottom: 6 }}>{p.label}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{p.name}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, whiteSpace: "pre-line" }}>{p.address}</div>
        </div>
      ))}
    </div>
  );

  const footer = (
    <div
      data-template-footer="noir"
      style={{
        borderTop: `1px solid rgba(255,255,255,0.08)`,
        paddingTop: 12,
        marginTop: "auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: 1, textTransform: "uppercase" }}>
        {data.businessName}
      </span>
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: 0.5 }}>
        {data.kind} · {data.documentNumber}{data.validUntil ? ` · Valid until ${data.validUntil}` : ""}
      </span>
    </div>
  );

  const autoGeneratedNote = (
    <div style={{ marginTop: 18, fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.65 }}>
      This is an auto-generated document. No signature required.
    </div>
  );

  const notesSection = (layoutMode: DocumentLayoutMode) =>
    data.notes ? (
      <div style={{ marginTop: layoutMode === "compact" ? 12 : 18 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>Notes</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{data.notes}</div>
      </div>
    ) : null;

  if (data.kind === "receipt") {
    return (
      <DocumentShell accentClass="">
        <div style={{ fontFamily: FONT, display: "flex", flexDirection: "column", flex: 1, color: "#fff", background: bg, margin: "calc(-1 * clamp(1.25rem,2.8vw,2.5rem))", padding: "clamp(1.25rem,2.8vw,2.5rem)" } as React.CSSProperties}>
          {header}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingTop: 20 }}>
            {parties("Issued by", "Received from")}
            <NoirTotals data={data} compact={false} accent={accent} />
            {notesSection("comfortable")}
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
          <div style={{ fontFamily: FONT, display: "flex", flexDirection: "column", flex: 1, color: "#fff", background: bg, margin: "calc(-1 * clamp(1.25rem,2.8vw,2.5rem))", padding: "clamp(1.25rem,2.8vw,2.5rem)" } as React.CSSProperties}>
            {page.isFirstPage ? (
              <>
                {header}
                <div style={{ paddingTop: 0 }}>
                  {parties(data.kind === "invoice" ? "From" : "Prepared by", data.kind === "invoice" ? "Bill to" : "Prepared for")}
                </div>
                {page.totalPages > 1 ? (
                  <div style={{ marginBottom: 12 }}>
                    <DocumentPageMeta data={data} pageNumber={page.pageNumber} totalPages={page.totalPages} />
                  </div>
                ) : null}
              </>
            ) : (
              <div style={{ marginBottom: 12, paddingTop: 16 }}>
                <DocumentPageMeta data={data} pageNumber={page.pageNumber} totalPages={page.totalPages} />
              </div>
            )}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <NoirLineItems data={data} items={page.lineItems} layoutMode={layoutMode} accent={accent} />
              {page.showTotals ? (
                <>
                  <NoirTotals data={data} compact={layoutMode === "compact"} accent={accent} />
                  {autoGeneratedNote}
                </>
              ) : null}
            </div>
            {page.isFinalPage ? footer : null}
          </div>
        </DocumentShell>
      )}
    />
  );
}
