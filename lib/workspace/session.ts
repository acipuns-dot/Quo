export type WorkspacePlan = "free" | "premium";

export function resolveWorkspacePlan(plan: unknown): WorkspacePlan {
  return plan === "premium" ? "premium" : "free";
}

export function canAccessPremiumWorkspace(
  user: { id: string } | null,
  plan: WorkspacePlan | null,
) {
  return Boolean(user && resolveWorkspacePlan(plan) === "premium");
}

export function resolveWorkspaceAccess(
  user: { id: string } | null,
  plan: WorkspacePlan | null,
  kind: "quotation" | "invoice" | "receipt",
) {
  if (!user) {
    return { allowed: false, redirectTo: "/login" };
  }

  if (resolveWorkspacePlan(plan) !== "premium") {
    return { allowed: false, redirectTo: `/${kind}?upsell=workspace` };
  }

  return { allowed: true as const, redirectTo: null };
}
