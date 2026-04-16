import React from "react";
import { formatCurrency } from "../../../lib/documents/format";
import { formatLineItemQuantity } from "../../../lib/documents/line-items";
import { getThemeById } from "../../../lib/documents/templates";
import type { ModernPdfModel } from "../../../lib/documents/pdf-model";

const FONT = "'DM Sans', system-ui, sans-serif";

export function ModernPdfRenderer({ model }: { model: ModernPdfModel }) {
  const theme = getThemeById(model.themeId);
  const { accent, dark, gradient, glow, metaBg, metaBorder } = theme;

  const bleed = "8mm";
  const showHeaderBusinessName = !model.header.logoDataUrl;

  const labelStyle = (color = "#888"): React.CSSProperties => ({
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "2.5px",
    textTransform: "uppercase",
    color,
  });

  return (
    <div
      data-renderer-id="modern-pdf"
      style={{ display: "flex", flexDirection: "column", gap: 0 }}
    >
      {model.pages.map((page) => (
        <article
          key={`${model.header.documentNumber}-${page.pageNumber}`}
          className="document-sheet"
          style={{
            width: "210mm",
            height: "297mm",
            background: "#ffffff",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: bleed,
              paddingBottom: 0,
              fontFamily: FONT,
              display: "flex",
              flexDirection: "column",
              flex: 1,
            }}
          >
            {page.isFirstPage ? (
              <>
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
                  <div
                    style={{
                      position: "absolute",
                      top: -80,
                      right: -80,
                      width: 300,
                      height: 300,
                      background: glow,
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-end",
                      position: "relative",
                    }}
                  >
                    <div>
                      {model.header.logoDataUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- printable document templates use runtime data URLs here
                        <img
                          src={model.header.logoDataUrl}
                          alt=""
                          style={{ height: 40, width: "auto", objectFit: "contain", marginBottom: 10, filter: "brightness(0) invert(1)", opacity: 0.85 }}
                        />
                      ) : null}
                      {showHeaderBusinessName ? (
                        <div
                          style={{
                            fontSize: 28,
                            fontWeight: 900,
                            color: "#fff",
                            letterSpacing: -1,
                            lineHeight: 1,
                          }}
                        >
                          {model.header.businessName}
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
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 800,
                          color: "#fff",
                          letterSpacing: -0.5,
                          textTransform: "uppercase",
                        }}
                      >
                        {model.header.kindLabel}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.4)",
                          marginTop: 4,
                        }}
                      >
                        {model.header.documentNumber}
                      </div>
                    </div>
                  </div>
                </div>
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
                    { label: "Date Issued", value: model.header.documentDate },
                    { label: "Valid Until", value: model.header.validUntil || "—" },
                  ].map((cell, index) => (
                    <div
                      key={cell.label}
                      style={{
                        padding: "14px 20px",
                        borderRight: index < 1 ? `1px solid ${metaBorder}` : undefined,
                      }}
                    >
                      <div style={labelStyle()}>{cell.label}</div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#fff",
                          marginTop: 3,
                        }}
                      >
                        {cell.value}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      color: "#888",
                      fontSize: 10,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    <span>{model.header.documentNumber}</span>
                    <span>
                      Page {page.pageNumber} of {page.totalPages}
                    </span>
                  </div>
                </div>
              </>
            ) : (
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
                  <div
                    style={{
                      position: "absolute",
                      top: -96,
                      right: -96,
                      width: 220,
                      height: 220,
                      background: glow,
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: "#fff",
                        textTransform: "uppercase",
                        letterSpacing: "0.16em",
                      }}
                    >
                      {model.header.kindLabel}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.6)",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {model.header.documentNumber}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      color: "#888",
                      fontSize: 10,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    <span>{model.header.documentNumber}</span>
                    <span>
                      Page {page.pageNumber} of {page.totalPages}
                    </span>
                  </div>
                </div>
              </>
            )}

            <div style={{ flex: 1 }}>
              {page.isFirstPage ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 28,
                    marginTop: 28,
                    marginBottom: 24,
                  }}
                >
                  <div>
                    <div style={labelStyle(accent)}>{model.parties.fromLabel}</div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#111",
                        marginTop: 6,
                      }}
                    >
                      {model.parties.businessName}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#666",
                        marginTop: 2,
                        lineHeight: 1.6,
                        whiteSpace: "pre-line",
                      }}
                    >
                      {model.parties.businessAddress}
                    </div>
                  </div>
                  <div>
                    <div style={labelStyle(accent)}>{model.parties.toLabel}</div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#111",
                        marginTop: 6,
                      }}
                    >
                      {model.parties.customerName}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#666",
                        marginTop: 2,
                        lineHeight: 1.6,
                        whiteSpace: "pre-line",
                      }}
                    >
                      {model.parties.customerAddress}
                    </div>
                  </div>
                </div>
              ) : null}

              {model.kind === "receipt" ? (
                <div
                  style={{
                    border: "1px solid #ede9e4",
                    borderRadius: 12,
                    padding: "20px 24px",
                    marginTop: page.isFirstPage ? 0 : 24,
                  }}
                >
                  <div style={labelStyle("#888")}>Amount received</div>
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 32,
                      fontWeight: 800,
                      color: "#111",
                    }}
                  >
                    {formatCurrency(model.totals.total, model.currency)}
                  </div>
                </div>
              ) : (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginTop: page.isFirstPage ? 0 : 20,
                    fontSize: 12,
                  }}
                >
                  <thead>
                    <tr style={{ background: dark, color: "#fff" }}>
                      {["Deliverable", "Unit", "Unit Price", "Amount"].map((label, index) => (
                        <th
                          key={label}
                          style={{
                            padding: "12px 14px",
                            textAlign: index === 0 ? "left" : "right",
                            fontSize: 10,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                          }}
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {page.lineItems.map((item, index) => (
                      <tr key={item.id} style={{ background: index % 2 === 0 ? "#fff" : "#faf9f8" }}>
                        <td
                          style={{
                            padding: "12px 14px",
                            borderBottom: "1px solid #eee",
                            verticalAlign: "top",
                          }}
                        >
                          <div style={{ fontWeight: 600, color: "#111" }}>{item.description}</div>
                          {item.note ? (
                            <div
                              style={{
                                marginTop: 4,
                                fontSize: 11,
                                color: "#777",
                                lineHeight: 1.5,
                              }}
                            >
                              {item.note}
                            </div>
                          ) : null}
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            borderBottom: "1px solid #eee",
                            textAlign: "right",
                            color: "#555",
                          }}
                        >
                          {formatLineItemQuantity(item)}
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            borderBottom: "1px solid #eee",
                            textAlign: "right",
                            color: "#555",
                          }}
                        >
                          {formatCurrency(item.unitPrice, model.currency)}
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            borderBottom: "1px solid #eee",
                            textAlign: "right",
                            color: "#111",
                            fontWeight: 700,
                          }}
                        >
                          {formatCurrency(item.quantity * item.unitPrice, model.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {page.showTotals && model.kind !== "receipt" ? (
                <div
                  style={{
                    marginTop: 8,
                    marginLeft: "auto",
                    width: "100%",
                    maxWidth: 360,
                    border: "1px solid #ede9e4",
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "12px 18px",
                      borderBottom: "1px solid #eee",
                      color: "#888",
                      fontSize: 12,
                    }}
                  >
                    <span style={{ textTransform: "uppercase", letterSpacing: "0.1em" }}>Subtotal</span>
                    <span>{formatCurrency(model.totals.subtotal, model.currency)}</span>
                  </div>
                  {model.applyTax ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "12px 18px",
                        borderBottom: "1px solid #eee",
                        color: "#888",
                        fontSize: 12,
                      }}
                    >
                      <span style={{ textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        {model.taxLabel}
                      </span>
                      <span>{formatCurrency(model.totals.taxAmount, model.currency)}</span>
                    </div>
                  ) : null}
                  {model.paymentTermSummary ? (
                    <div style={{ padding: "12px 18px", borderBottom: "1px solid #eee" }}>
                      <div style={labelStyle("#888")}>Payment terms</div>
                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#111",
                        }}
                      >
                        {model.paymentTermSummary.label}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: 8,
                          color: "#888",
                          fontSize: 12,
                        }}
                      >
                        <span style={{ textTransform: "uppercase", letterSpacing: "0.1em" }}>
                          Amount due now
                        </span>
                        <span>
                          {formatCurrency(model.paymentTermSummary.amountDue, model.currency)}
                        </span>
                      </div>
                    </div>
                  ) : null}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "14px 18px",
                      background: accent,
                      color: "#fff",
                    }}
                  >
                    <span
                      style={{
                        textTransform: "uppercase",
                        letterSpacing: "0.14em",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      Total
                    </span>
                    <span style={{ fontSize: 18, fontWeight: 800 }}>
                      {formatCurrency(model.totals.total, model.currency)}
                    </span>
                  </div>
                </div>
              ) : null}

              {page.showNotes ? (
                <div
                  style={{
                    marginTop: 20,
                    paddingTop: 16,
                    borderTop: "1px solid #eee",
                  }}
                >
                  {model.notes ? (
                    <div style={{ marginBottom: 12 }}>
                      <div style={labelStyle(accent)}>Notes</div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#555",
                          marginTop: 6,
                          lineHeight: 1.65,
                          whiteSpace: "pre-line",
                        }}
                      >
                        {model.notes}
                      </div>
                    </div>
                  ) : null}
                  <div style={{ fontSize: 12, color: "#888", lineHeight: 1.65 }}>
                    This is an auto-generated document. No signature required.
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div
            style={{
              background: dark,
              padding: `14px ${bleed}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0,
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
              {model.footer.businessName.toUpperCase()}
            </span>
            <span
              style={{
                flexShrink: 0,
                fontSize: 10,
                color: "rgba(255,255,255,0.3)",
                letterSpacing: 0.5,
              }}
            >
              {model.footer.kindLabel} · {model.footer.documentNumber}
              {model.footer.validUntil ? ` · Valid until ${model.footer.validUntil}` : ""}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
