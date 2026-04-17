import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeItemRow } from "./normalizers";
import type { ItemRecord } from "./types";

export async function listItemsForBusiness(
  supabase: SupabaseClient,
  businessId: string,
): Promise<ItemRecord[]> {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("business_id", businessId)
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => normalizeItemRow(item as Record<string, unknown>));
}
