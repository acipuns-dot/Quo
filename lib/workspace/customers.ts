import type { SupabaseClient } from "@supabase/supabase-js";
import type { CustomerRecord } from "./types";

export async function listCustomersForBusiness(
  supabase: SupabaseClient,
  businessId: string,
): Promise<CustomerRecord[]> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("business_id", businessId)
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => ({
    id: item.id,
    businessId: item.business_id,
    name: item.name,
    address: item.address,
    email: item.email,
    phone: item.phone,
    taxNumber: item.tax_number,
    notes: item.notes,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
}
