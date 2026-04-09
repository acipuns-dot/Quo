import type { DocumentData, PaymentTermPreset } from "./types";
import { getRenderableLineItems } from "./line-items";

function normalizeDecimalString(value: number) {
  const text = value.toString();

  if (!/[eE]/.test(text)) {
    return text;
  }

  const match = text.match(/^([+-]?)(\d+)(?:\.(\d+))?[eE]([+-]?\d+)$/);
  if (!match) {
    return text;
  }

  const [, sign, integerPart, fractionPart = "", exponentPart] = match;
  const digits = `${integerPart}${fractionPart}`;
  const exponent = Number(exponentPart) - fractionPart.length;

  if (exponent >= 0) {
    return `${sign}${digits}${"0".repeat(exponent)}`;
  }

  const padding = "0".repeat(Math.max(0, -exponent - digits.length));
  const splitIndex = digits.length + exponent;

  return `${sign}0.${padding}${digits.slice(0, splitIndex)}${digits.slice(splitIndex)}`;
}

function parseDecimal(value: number) {
  const text = normalizeDecimalString(value);
  const negative = text.startsWith("-");
  const normalized = negative ? text.slice(1) : text;
  const [wholePart, fractionPart = ""] = normalized.split(".");

  return {
    digits: BigInt(`${wholePart}${fractionPart}`),
    scale: fractionPart.length,
    negative,
  };
}

function roundHalfUp(value: bigint, divisor: bigint) {
  const adjustment = divisor / 2n;
  return value >= 0n ? (value + adjustment) / divisor : (value - adjustment) / divisor;
}

function lineItemToCents(quantity: number, unitPrice: number) {
  const quantityDecimal = parseDecimal(quantity);
  const priceDecimal = parseDecimal(unitPrice);
  const raw = quantityDecimal.digits * priceDecimal.digits;
  const scale = quantityDecimal.scale + priceDecimal.scale;
  const negative = quantityDecimal.negative !== priceDecimal.negative;

  let cents: bigint;
  if (scale >= 2) {
    const divisor = 10n ** BigInt(scale - 2);
    cents = roundHalfUp(raw, divisor);
  } else {
    const multiplier = 10n ** BigInt(2 - scale);
    cents = raw * multiplier;
  }

  return negative ? -cents : cents;
}

function taxRateToCents(subtotalCents: bigint, taxRate: number) {
  const rate = parseDecimal(taxRate);
  const divisor = 10n ** BigInt(rate.scale + 2);
  const raw = subtotalCents * rate.digits;
  return rate.negative ? -roundHalfUp(raw, divisor) : roundHalfUp(raw, divisor);
}

const PAYMENT_TERM_LABELS: Record<Exclude<PaymentTermPreset, "custom">, string> = {
  full: "Full payment",
  half: "Half payment",
  deposit_30: "30% deposit",
  deposit_40: "40% deposit",
  deposit_50: "50% deposit",
};

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateDocumentTotals(data: DocumentData) {
  const subtotalCents = getRenderableLineItems(data.lineItems).reduce(
    (sum, item) => sum + lineItemToCents(item.quantity, item.unitPrice),
    0n,
  );
  const taxCents = taxRateToCents(subtotalCents, data.taxRate);
  const totalCents = subtotalCents + taxCents;

  return {
    subtotal: Number(subtotalCents) / 100,
    taxAmount: Number(taxCents) / 100,
    total: Number(totalCents) / 100,
  };
}

export function getPaymentTermSummary(data: DocumentData) {
  if (!data.paymentTermPreset || data.paymentTermPercentage === null) {
    return null;
  }

  const percentage = data.paymentTermPercentage;
  if (percentage <= 0 || percentage > 100) {
    return null;
  }

  const total = calculateDocumentTotals(data).total;
  const amountDue = roundCurrency(total * (percentage / 100));
  const baseLabel =
    data.paymentTermPreset === "custom"
      ? (data.paymentTermLabel.trim() || "Custom payment")
      : PAYMENT_TERM_LABELS[data.paymentTermPreset];

  return {
    label: `${baseLabel} (${percentage}%)`,
    percentage,
    amountDue,
  };
}
