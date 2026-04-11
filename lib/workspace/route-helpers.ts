import { z } from "zod";
import { createSupabaseServerClient } from "../supabase/server";

export const businessPayloadSchema = z.object({
  name: z.string().trim().min(1).max(120),
  address: z.string().max(300),
  email: z.string().max(160),
  phone: z.string().max(40),
  taxNumber: z.string().max(60),
  defaultCurrency: z.string().trim().min(1).max(8),
  defaultTaxLabel: z.string().max(40),
  defaultTaxRate: z.number().min(0).max(100),
  defaultPaymentTerms: z.string().max(80),
  logoUrl: z.string().nullable(),
  notes: z.string().max(500),
});

export const customerPayloadSchema = z.object({
  name: z.string().trim().min(1).max(120),
  address: z.string().max(300),
  email: z.string().max(160),
  phone: z.string().max(40),
  taxNumber: z.string().max(60),
  notes: z.string().max(500),
});

export function normalizeBusinessPayload(input: z.input<typeof businessPayloadSchema>) {
  return businessPayloadSchema.parse({
    ...input,
    name: input.name.trim(),
    defaultCurrency: input.defaultCurrency.trim(),
    logoUrl: input.logoUrl?.trim() ? input.logoUrl.trim() : null,
  });
}

export function normalizeCustomerPayload(input: z.input<typeof customerPayloadSchema>) {
  return customerPayloadSchema.parse({
    ...input,
    name: input.name.trim(),
    address: input.address.trim(),
  });
}

export async function userOwnsBusiness(
  userId: string,
  businessId: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
) {
  const { data, error } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

export function buildBusinessDeleteGuard({
  customerCount,
  documentCount,
}: {
  customerCount: number;
  documentCount: number;
}) {
  const needsForceDelete = customerCount > 0 || documentCount > 0;

  return {
    canDelete: !needsForceDelete,
    needsForceDelete,
    customerCount,
    documentCount,
  };
}
