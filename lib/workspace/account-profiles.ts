import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { DocumentKind } from "../documents/types";
import type { WorkspacePlan } from "./session";
import { normalizeWorkspaceAccountProfileRow } from "./normalizers";

export type WorkspaceAccountProfile = {
  userId: string;
  plan: WorkspacePlan;
  shortId: string | null;
  createdAt: string;
  updatedAt: string;
};

type UserProfileRow = {
  user_id: string;
  plan: WorkspacePlan;
  short_id: string | null;
  created_at: string;
  updated_at: string;
};

export function normalizeWorkspaceAccountProfile(row: UserProfileRow): WorkspaceAccountProfile {
  return normalizeWorkspaceAccountProfileRow(row as Record<string, unknown>);
}

export function resolvePostAuthPath(plan: WorkspacePlan, kind: DocumentKind = "invoice") {
  return plan === "premium" ? `/workspace/${kind}` : `/${kind}`;
}

export async function getWorkspaceAccountProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<WorkspaceAccountProfile | null> {
  const [profileResult, billingResult] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("user_id, plan, short_id, created_at, updated_at")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("billing_subscriptions")
      .select("status")
      .eq("user_id", userId)
      .eq("provider", "paypal")
      .in("status", ["ACTIVE", "APPROVED"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const { data, error } = profileResult;
  const { data: activeBillingSubscription, error: billingError } = billingResult;

  if (error) {
    throw error;
  }

  if (billingError) {
    throw billingError;
  }

  if (!data && !activeBillingSubscription) {
    return null;
  }

  const resolvedPlan: WorkspacePlan = activeBillingSubscription ? "premium" : (data?.plan ?? "free");

  if (data && data.plan === resolvedPlan) {
    return normalizeWorkspaceAccountProfileRow(data as Record<string, unknown>);
  }

  const { data: syncedProfile, error: syncError } = await supabase
    .from("user_profiles")
    .upsert({ user_id: userId, plan: resolvedPlan }, { onConflict: "user_id" })
    .select("user_id, plan, short_id, created_at, updated_at")
    .single();

  if (syncError) {
    throw syncError;
  }

  return normalizeWorkspaceAccountProfileRow(syncedProfile as Record<string, unknown>);
}

export async function ensureWorkspaceAccountProfile(
  supabase: SupabaseClient,
  user: Pick<User, "id">,
): Promise<WorkspaceAccountProfile> {
  const existing = await getWorkspaceAccountProfile(supabase, user.id);

  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .insert({ user_id: user.id, plan: "free" })
    .select("user_id, plan, short_id, created_at, updated_at")
    .single();

  if (error) {
    throw error;
  }

  return normalizeWorkspaceAccountProfileRow(data as Record<string, unknown>);
}
