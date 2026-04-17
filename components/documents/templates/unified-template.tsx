import React from "react";
import { getThemeById } from "../../../lib/documents/templates";
import type { DocumentData } from "../../../lib/documents/types";
import { DocumentLineItems } from "../document-line-items";
import { DocumentPageMeta } from "../document-page-meta";
import { DocumentPaginatedLayout } from "../document-paginated-layout";
import { DocumentShell } from "../document-shell";
import { DocumentTotals } from "../document-totals";

const FONT = "'DM Sans', system-ui, sans-serif";

export function UnifiedTemplate({ data }: { data: DocumentData }) {
  const theme = getThemeById(data.themeId);
  const { accent, dark, gradient, glow, metaBg, metaBorder } = theme;

  const showHeaderBusinessName = !data.logoDataUrl;

  const lbl = (color = "#888") => ({
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "2.5px",
    textTransform: "uppercase" as const,
    color,
  });

  const bleed = "clamp(1.25rem, 2.8vw, 2.5rem)";

  const header = (
    <div
      style={{
        background: gradient,
        marginLeft: `calc(-1 * ${bleed})`,
        marginRight: `calc(-1 * ${bleed})`,
        marginTop: `calc(-1 * ${bleed})`,
        padding: `2rem ${bleed}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, background: glow }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
        <div>
          {data.logoDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- printable document templates use runtime data URLs here
            <img
              src={data.logoDataUrl}
              alt=""
              style={{ height: 40, width: "auto", objectFit: "contain", marginBottom: 10, filter: "brightness(0) invert(1)", opacity: 0.85 }}
            />
          )}
          {showHeaderBusinessName ? (
            <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: -1, lineHeight: 1 }}>
              {data.businessName}
            </div>
          ) : null}
        </div>
        <div
          style={{
            width: 160,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: -0.5, textTransform: "uppercase" as const }}>
            {data.kind}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
            {data.documentNumber}
          </div>
        </div>
      </div>
    </div>
  );

  const metaStrip = (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        background: metaBg,
        marginLeft: `calc(-1 * ${bleed})`,
        marginRight: `calc(-1 * ${bleed})`,
      }}
    >
      {[
        { label: "Date Issued", value: data.documentDate },
        { label: "Valid Until", value: data.validUntil || "—" },
      ].map((cell, i) => (
        <div key={i} style={{ padding: "14px 20px", borderRight: i < 1 ? `1px solid ${metaBorder}` : undefined }}>
          <div style={lbl()}>{cell.label}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginTop: 3 }}>{cell.value}</div>
        </div>
      ))}
    </div>
  );

  const continuationHeader = (pageNumber: number, totalPages: number) => (
    <>
      <div
        style={{
          background: gradient,
          marginLeft: `calc(-1 * ${bleed})`,
          marginRight: `calc(-1 * ${bleed})`,
          marginTop: `calc(-1 * ${bleed})`,
          padding: `1.1rem ${bleed}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: -96, right: -96, width: 220, height: 220, background: glow }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", textTransform: "uppercase" as const, letterSpacing: "0.16em" }}>
            {data.kind}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", letterSpacing: "0.08em" }}>
            {data.documentNumber}
          </div>
        </div>
      </div>
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
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginTop: 28, marginBottom: 24 }}>
      <div>
        <div style={lbl(accent)}>{fromLabel}</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#111", marginTop: 6 }}>{data.businessName}</div>
        <div style={{ fontSize: 12, color: "#666", marginTop: 2, lineHeight: 1.6, whiteSpace: "pre-line" }}>{data.businessAddress}</div>
      </div>
      <div>
        <div style={lbl(accent)}>{toLabel}</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#111", marginTop: 6 }}>{data.customerName}</div>
        <div style={{ fontSize: 12, color: "#666", marginTop: 2, lineHeight: 1.6, whiteSpace: "pre-line" }}>{data.customerAddress}</div>
      </div>
    </div>
  );

  const footer = (
    <div
      data-template-footer="default"
      style={{
        background: dark,
        marginLeft: `calc(-1 * ${bleed})`,
        marginRight: `calc(-1 * ${bleed})`,
        marginTop: "auto",
        padding: `14px ${bleed}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span
        style={{
          flex: 1,
          minWidth: 0,
          marginRight: 12,
          fontSize: 12,
          fontWeight: 800,
          color: accent,
          letterSpacing: 1.5,
        }}
      >
        {data.businessName.toUpperCase()}
      </span>
      <span style={{ flexShrink: 0, fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 0.5 }}>
        {data.kind} · {data.documentNumber}{data.validUntil ? ` · Valid until ${data.validUntil}` : ""}
      </span>
    </div>
  );

  if (data.kind === "receipt") {
    return (
      <DocumentShell accentClass="">
        <div style={{ fontFamily: FONT, display: "flex", flexDirection: "column", flex: 1 }}>
          {header}
          {metaStrip}
          <div style={{ flex: 1 }}>
            {parties("Issued by", "Received from")}
            <DocumentTotals
              data={data}
              totalBg="rounded-lg"
              totalStyle={{ backgroundColor: accent, color: "#ffffff" }}
            />
            <div style={{ marginTop: 20 }}>
              {data.notes ? (
                <div style={{ marginBottom: 12 }}>
                  <div style={lbl(accent)}>Notes</div>
                  <div style={{ fontSize: 12, color: "#555", marginTop: 6, lineHeight: 1.65, whiteSpace: "pre-line" }}>{data.notes}</div>
                </div>
              ) : null}
              <div style={{ fontSize: 12, color: "#888", lineHeight: 1.65 }}>This is an auto-generated document. No signature required.</div>
            </div>
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
                {header}
                {metaStrip}
                {page.totalPages > 1 ? (
                  <div style={{ marginTop: 20 }}>
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
              <DocumentLineItems
                data={data}
                items={page.lineItems}
                layoutMode={layoutMode}
                headerBg=""
                headerStyle={{ backgroundColor: dark, color: "#fff" }}
                headerText=""
              />
              {page.showTotals ? (
                <div style={{ marginTop: 8 }}>
                  <DocumentTotals
                    data={data}
                    compact={layoutMode === "compact"}
                    totalBg="rounded-lg"
                    totalStyle={{ backgroundColor: accent, color: "#ffffff" }}
                  />
                </div>
              ) : null}
              {page.showNotes ? (
                <div
                  style={{
                    marginTop: layoutMode === "compact" ? 14 : 20,
                    paddingTop: 16,
                    borderTop: "1px solid #eee",
                  }}
                >
                  {data.notes ? (
                    <div style={{ marginBottom: 12 }}>
                      <div style={lbl(accent)}>Notes</div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#555",
                          marginTop: 6,
                          lineHeight: layoutMode === "compact" ? 1.5 : 1.65,
                          whiteSpace: "pre-line",
                        }}
                      >
                        {data.notes}
                      </div>
                    </div>
                  ) : null}
                  <div style={{ fontSize: 12, color: "#888", lineHeight: layoutMode === "compact" ? 1.5 : 1.65 }}>This is an auto-generated document. No signature required.</div>
                </div>
              ) : null}
            </div>
            {footer}
          </div>
        </DocumentShell>
      )}
    />
  );
}
