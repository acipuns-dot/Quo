import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeCustomerRow } from "./normalizers";
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

  return (data ?? []).map((item) => normalizeCustomerRow(item as Record<string, unknown>));
}
