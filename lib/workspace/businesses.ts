import type { SupabaseClient } from "@supabase/supabase-js";
import type { BusinessRecord } from "./types";

export function resolveActiveBusiness(
  businesses: BusinessRecord[],
  businessId: string | null | undefined,
) {
  if (businesses.length === 0) {
    return undefined;
  }

  return businesses.find((business) => business.id === businessId) ?? businesses[0];
}

export async function listBusinessesForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<BusinessRecord[]> {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => ({
    id: item.id,
    userId: item.user_id,
    name: item.name,
    address: item.address,
    email: item.email,
    phone: item.phone,
    taxNumber: item.tax_number,
    defaultCurrency: item.default_currency,
    defaultTaxLabel: item.default_tax_label,
    defaultTaxRate: item.default_tax_rate,
    defaultPaymentTerms: item.default_payment_terms,
    logoUrl: item.logo_url,
    notes: item.notes,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
}
