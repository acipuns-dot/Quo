import { z } from "zod";
import { documentSchema } from "../documents/schema";

const isoDateTimeSchema = z.string().datetime();

export const businessRecordSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  name: z.string().trim().min(1).max(120),
  address: z.string().max(300),
  email: z.string().max(160),
  phone: z.string().max(40),
  taxNumber: z.string().max(60),
  defaultCurrency: z.string().trim().min(1).max(8),
  defaultTaxLabel: z.string().max(40),
  defaultTaxRate: z.number().min(0).max(100),
  defaultPaymentTerms: z.string().max(80),
  logoUrl: z.string().url().nullable(),
  notes: z.string().max(500),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});

export const customerRecordSchema = z.object({
  id: z.string().min(1),
  businessId: z.string().min(1),
  name: z.string().trim().min(1).max(120),
  address: z.string().max(300),
  email: z.string().max(160),
  phone: z.string().max(40),
  taxNumber: z.string().max(60),
  notes: z.string().max(500),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});

export const savedDocumentRecordSchema = z.object({
  id: z.string().min(1),
  businessId: z.string().min(1),
  customerId: z.string().min(1).nullable(),
  kind: z.enum(["quotation", "invoice", "receipt"]),
  status: z.enum(["draft", "exported"]),
  documentNumber: z.string().max(80),
  issueDate: z.string().max(20),
  payloadVersion: z.number().int().positive(),
  payload: documentSchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});
