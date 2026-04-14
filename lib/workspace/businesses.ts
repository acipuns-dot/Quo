import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeBusinessRow } from "./normalizers";
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

  return (data ?? []).map((item) => normalizeBusinessRow(item as Record<string, unknown>));
}
