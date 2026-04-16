import { z } from "zod";
import { BUILT_IN_LINE_ITEM_UNITS } from "./line-items";
import { DOCUMENT_KINDS, PAYMENT_TERM_PRESETS, type PaymentTermPreset } from "./types";

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(value: string): boolean {
  if (!isoDatePattern.test(value)) {
    return false;
  }

  const [yearText, monthText, dayText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const candidate = new Date(Date.UTC(year, month - 1, day));

  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
  );
}

const builtInUnitSchema = z.enum(BUILT_IN_LINE_ITEM_UNITS);

export const lineItemSchema = z.object({
  id: z.string().min(1),
  description: z.string().trim().min(1, "Line item description is required.").max(200),
  note: z.string().max(300),
  quantity: z.number().min(0, "Quantity cannot be negative."),
  unit: builtInUnitSchema.optional().default(""),
  customUnit: z.string().trim().max(20).optional().default(""),
  unitPrice: z.number().min(0, "Unit price cannot be negative."),
}).superRefine((item, ctx) => {
  if (item.unit === "custom" && !item.customUnit.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["customUnit"],
      message: "Custom unit is required.",
    });
  }
});

const paymentTermPresetSchema = z.union([
  z.literal(""),
  z.enum(PAYMENT_TERM_PRESETS),
]);

const PRESET_PERCENTAGES: Record<Exclude<PaymentTermPreset, "custom">, number> = {
  full: 100,
  half: 50,
  deposit_30: 30,
  deposit_40: 40,
  deposit_50: 50,
};

const baseDocumentSchema = z.object({
  kind: z.enum(DOCUMENT_KINDS),
  templateId: z.string().min(1),
  themeId: z.string().min(1),
  businessName: z.string().trim().min(1, "Business name is required.").max(120),
  businessAddress: z.string().max(300),
  customerName: z.string().trim().min(1, "Customer name is required.").max(120),
  customerAddress: z.string().max(300),
  documentNumber: z.string().trim().min(1, "Document number is required.").max(40),
  currency: z.string().trim().min(1, "Currency is required.").max(10),
  applyTax: z.boolean().optional().default(true),
  taxLabel: z.string().trim().max(40),
  taxRate: z.number().min(0, "Tax rate cannot be negative.").max(100, "Tax rate cannot exceed 100."),
  validUntil: z.string().max(20).optional().default(""),
  paymentTerms: z.string().max(80).optional().default(""),
  paymentTermPreset: paymentTermPresetSchema.optional().default(""),
  paymentTermPercentage: z.number().min(0, "Payment percentage cannot be negative.").max(100, "Payment percentage cannot exceed 100.").nullable().optional().default(null),
  paymentTermLabel: z.string().max(80).optional().default(""),
  notes: z.string().max(500),
  paymentMethod: z.string().max(80),
  amountReceived: z.number().min(0, "Amount received cannot be negative."),
  logoDataUrl: z.string().nullable(),
  documentDate: z
    .string()
    .min(1, "Document date is required.")
    .refine(isValidIsoDate, {
      message: "Enter a valid date.",
    }),
  lineItems: z.array(lineItemSchema).min(1, "Add at least one line item."),
});

export const documentSchema = baseDocumentSchema.superRefine((data, ctx) => {
  if (data.applyTax && !data.taxLabel.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["taxLabel"],
      message: "Tax label is required.",
    });
  }

  if (!data.paymentTermPreset) {
    if (data.paymentTermPercentage !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["paymentTermPercentage"],
        message: "Choose a payment term preset first.",
      });
    }
    return;
  }

  if (data.paymentTermPreset === "custom") {
    if (
      data.paymentTermPercentage === null ||
      data.paymentTermPercentage <= 0 ||
      data.paymentTermPercentage > 100
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["paymentTermPercentage"],
        message: "Enter a custom payment percentage between 0 and 100.",
      });
    }
    return;
  }

  if (data.paymentTermPercentage !== PRESET_PERCENTAGES[data.paymentTermPreset]) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["paymentTermPercentage"],
      message: "Preset payment terms must use the matching percentage.",
    });
  }
});
