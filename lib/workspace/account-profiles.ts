import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { DocumentKind } from "../documents/types";
import type { WorkspacePlan } from "./session";
import { normalizeWorkspaceAccountProfileRow } from "./normalizers";

export type WorkspaceAccountProfile = {
  userId: string;
  plan: WorkspacePlan;
  createdAt: string;
  updatedAt: string;
};

type UserProfileRow = {
  user_id: string;
  plan: WorkspacePlan;
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
  const { data, error } = await supabase
    .from("user_profiles")
    .select("user_id, plan, created_at, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? normalizeWorkspaceAccountProfileRow(data as Record<string, unknown>) : null;
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
    .select("user_id, plan, created_at, updated_at")
    .single();

  if (error) {
    throw error;
  }

  return normalizeWorkspaceAccountProfileRow(data as Record<string, unknown>);
}
