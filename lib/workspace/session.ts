export type WorkspacePlan = "free" | "premium";

export function canAccessPremiumWorkspace(
  user: { id: string } | null,
  plan: WorkspacePlan | null,
) {
  return Boolean(user && plan === "premium");
}

export function resolveWorkspaceAccess(
  user: { id: string } | null,
  plan: WorkspacePlan | null,
  kind: "quotation" | "invoice" | "receipt",
) {
  if (!user) {
    return { allowed: false, redirectTo: "/login" };
  }

  if (plan !== "premium") {
    return { allowed: false, redirectTo: `/${kind}?upsell=workspace` };
  }

  return { allowed: true as const, redirectTo: null };
}
