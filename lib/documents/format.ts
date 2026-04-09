// Document displays currently use the US locale; we keep that explicit here.
const DOCUMENT_CURRENCY_LOCALE = "en-US";
const DOCUMENT_DECIMAL_FORMATTER = new Intl.NumberFormat(
  DOCUMENT_CURRENCY_LOCALE,
  {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
);

export function formatCurrency(value: number, currency: string) {
  try {
    return new Intl.NumberFormat(DOCUMENT_CURRENCY_LOCALE, {
      style: "currency",
      currency,
    }).format(value);
  } catch {
    return DOCUMENT_DECIMAL_FORMATTER.format(value);
  }
}
