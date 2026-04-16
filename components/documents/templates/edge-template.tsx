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

// ─── inline line items table (full styling control) ──────────────────────────

function EdgeLineItems({
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
  const cellV = compact ? "12px 16px" : "14px 16px";

  return (
    <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 13 }}>
      <thead>
        <tr>
          {["Deliverable", "Unit", "Unit Price", "Amount"].map((col, i) => (
            <th
              key={col}
              style={{
                padding: compact ? "10px 16px" : "12px 16px",
                textAlign: i === 0 ? "left" : "right",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: accent,
                borderBottom: `2px solid ${accent}`,
                borderTop: "1px solid #f0ede9",
                background: "#fff",
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
            <td style={{ padding: cellV, borderBottom: "1px solid #f0ede9", verticalAlign: "top", color: "#111", fontWeight: 600 }}>
              {item.description}
              {item.note ? (
                <div style={{ marginTop: 4, fontSize: 11, color: "#999", fontWeight: 400, lineHeight: 1.5 }}>
                  {item.note}
                </div>
              ) : null}
            </td>
            <td style={{ padding: cellV, borderBottom: "1px solid #f0ede9", textAlign: "right", color: "#555", fontVariantNumeric: "tabular-nums" }}>
              {formatLineItemQuantity(item)}
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

// ─── inline totals ────────────────────────────────────────────────────────────

function EdgeTotals({ data, compact, accent }: { data: DocumentData; compact: boolean; accent: string }) {
  if (data.kind === "receipt") {
    return (
      <div style={{ border: "1px solid #ede9e4", borderRadius: 8, padding: compact ? "16px 20px" : "20px 24px", textAlign: "right" }}>
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
    <div style={{ marginLeft: "auto", width: "100%", maxWidth: 320 }}>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #f0ede9", color: "#888", fontSize: 13 }}>
        <span style={{ textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 11 }}>Subtotal</span>
        <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatCurrency(totals.subtotal, data.currency)}</span>
      </div>
      {data.applyTax ? (
        <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `2px solid ${accent}`, color: "#888", fontSize: 13 }}>
          <span style={{ textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 11 }}>{data.taxLabel}</span>
          <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatCurrency(totals.taxAmount, data.currency)}</span>
        </div>
      ) : null}
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 0",
          printColorAdjust: "exact",
          WebkitPrintColorAdjust: "exact",
        }}
      >
        <span style={{ textTransform: "uppercase", letterSpacing: "0.14em", fontSize: 11, fontWeight: 700, color: accent }}>Total</span>
        <span style={{ fontSize: 22, fontWeight: 800, color: "#111", fontVariantNumeric: "tabular-nums", letterSpacing: -0.5 }}>
          {formatCurrency(totals.total, data.currency)}
        </span>
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export function EdgeTemplate({ data }: { data: DocumentData }) {
  const theme = getThemeById(data.themeId);
  const { accent } = theme;

  const bleed = "clamp(1.25rem, 2.8vw, 2.5rem)";

  // Thin accent top bar
  const topBar = (
    <div
      style={{
        height: 5,
        background: accent,
        marginLeft: `calc(-1 * ${bleed})`,
        marginRight: `calc(-1 * ${bleed})`,
        marginTop: `calc(-1 * ${bleed})`,
        printColorAdjust: "exact",
        WebkitPrintColorAdjust: "exact",
      }}
    />
  );

  // Light meta strip (white bg, muted labels)
  const metaStrip = (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        background: "#f9f7f5",
        marginLeft: `calc(-1 * ${bleed})`,
        marginRight: `calc(-1 * ${bleed})`,
        borderTop: "1px solid #ede9e4",
        borderBottom: "1px solid #ede9e4",
      }}
    >
      {[
        { label: "Date Issued", value: data.documentDate },
        { label: "Valid Until", value: data.validUntil || "—" },
      ].map((cell, i) => (
        <div key={i} style={{ padding: "12px 20px", borderRight: i < 1 ? "1px solid #ede9e4" : undefined }}>
          <div style={lbl("#bbb")}>{cell.label}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#222", marginTop: 3 }}>{cell.value}</div>
        </div>
      ))}
    </div>
  );

  // Header: business name left, document badge right — all on white
  const firstPageHeader = (
    <>
      {topBar}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingTop: 28, paddingBottom: 24 }}>
        <div>
          {data.logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- printable document templates use runtime data URLs here
            <img src={data.logoDataUrl} alt="" style={{ height: 40, width: "auto", objectFit: "contain" }} />
          ) : (
            <div style={{ fontSize: 26, fontWeight: 900, color: "#111", letterSpacing: -1, lineHeight: 1 }}>
              {data.businessName}
            </div>
          )}
        </div>
        <div
          data-edge-doc-header="true"
          style={{
            width: 160,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "5px 14px",
              borderRadius: 99,
              background: accent,
              fontSize: 11,
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "2px",
              textTransform: "uppercase",
              printColorAdjust: "exact",
              WebkitPrintColorAdjust: "exact",
            }}
          >
            {data.kind}
          </div>
          <div style={{ fontSize: 12, color: "#aaa", marginTop: 6, letterSpacing: 0.5 }}>
            {data.documentNumber}
          </div>
        </div>
      </div>
      {metaStrip}
    </>
  );

  const continuationHeader = (pageNumber: number, totalPages: number) => (
    <>
      {topBar}
      <div style={{ marginTop: 16 }}>
        <DocumentPageMeta
          data={data}
          pageNumber={pageNumber}
          totalPages={totalPages}
        />
      </div>
    </>
  );

  const parties = (fromLabel: string, toLabel: string) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 28, marginBottom: 24 }}>
      {[
        { label: fromLabel, name: data.businessName, address: data.businessAddress },
        { label: toLabel, name: data.customerName, address: data.customerAddress },
      ].map((party) => (
        <div
          key={party.label}
          style={{ borderLeft: `3px solid ${accent}`, paddingLeft: 14 }}
        >
          <div style={lbl(accent)}>{party.label}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#111", marginTop: 6 }}>{party.name}</div>
          <div style={{ fontSize: 12, color: "#777", marginTop: 3, lineHeight: 1.6, whiteSpace: "pre-line" }}>{party.address}</div>
        </div>
      ))}
    </div>
  );

  // Footer: accent bottom line + small text on white
  const footer = (
    <div
      data-template-footer="edge"
      style={{
        marginLeft: `calc(-1 * ${bleed})`,
        marginRight: `calc(-1 * ${bleed})`,
        marginTop: "auto",
        borderTop: `3px solid ${accent}`,
        padding: `12px ${bleed}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        printColorAdjust: "exact",
        WebkitPrintColorAdjust: "exact",
      }}
    >
      <span
        style={{
          flex: 1,
          minWidth: 0,
          marginRight: 12,
          fontSize: 11,
          fontWeight: 700,
          color: "#333",
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

  const notesAndNotice = (layoutMode: DocumentLayoutMode) => (
    <div
      style={{
        marginTop: layoutMode === "compact" ? 14 : 20,
        paddingTop: 16,
        borderTop: "1px solid #ede9e4",
      }}
    >
      {data.notes ? (
        <div style={{ marginBottom: 12 }}>
          <div style={lbl(accent)}>Notes</div>
          <div style={{ fontSize: 12, color: "#555", marginTop: 6, lineHeight: layoutMode === "compact" ? 1.5 : 1.65, whiteSpace: "pre-line" }}>
            {data.notes}
          </div>
        </div>
      ) : null}
      <div style={{ fontSize: 12, color: "#aaa", lineHeight: layoutMode === "compact" ? 1.5 : 1.65 }}>
        This is an auto-generated document. No signature required.
      </div>
    </div>
  );

  if (data.kind === "receipt") {
    return (
      <DocumentShell accentClass="">
        <div style={{ fontFamily: FONT, display: "flex", flexDirection: "column", flex: 1 }}>
          {firstPageHeader}
          <div style={{ flex: 1, marginTop: 24 }}>
            {parties("Issued by", "Received from")}
            <EdgeTotals data={data} compact={false} accent={accent} />
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
                {firstPageHeader}
                {page.totalPages > 1 ? (
                  <div style={{ marginTop: 16 }}>
                    <DocumentPageMeta
                      data={data}
                      pageNumber={page.pageNumber}
                      totalPages={page.totalPages}
                    />
                  </div>
                ) : null}
              </>
            ) : (
              continuationHeader(page.pageNumber, page.totalPages)
            )}
            <div style={{ flex: 1 }}>
              {page.isFirstPage ? parties("Prepared by", "Prepared for") : null}
              <EdgeLineItems data={data} items={page.lineItems} layoutMode={layoutMode} accent={accent} />
              {page.showTotals ? (
                <div style={{ marginTop: layoutMode === "compact" ? 12 : 16 }}>
                  <EdgeTotals data={data} compact={layoutMode === "compact"} accent={accent} />
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
