import React from "react";
import type { Metadata } from "next";
import { FreePlanShell } from "../../components/premium/free-plan-shell";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { getWorkspaceAccountProfile } from "../../lib/workspace/account-profiles";

export const metadata: Metadata = {
  title: "Invoice Generator | QUO Documents",
  description:
    "Create a modern invoice online with two template styles, live preview, and printable PDF output.",
};

export default async function InvoicePage({
  searchParams,
}: {
  searchParams?: Promise<{ upsell?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const hasSupabaseEnv = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  let account = { authenticated: false, plan: null as "free" | "premium" | null };

  if (hasSupabaseEnv) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const profile = await getWorkspaceAccountProfile(supabase, user.id);
      account = {
        authenticated: true,
        plan: profile?.plan ?? "free",
      };
    }
  }

  const initialUpsellFeature =
    resolvedSearchParams?.upsell === "workspace" ? "workspace" : null;

  return (
    <FreePlanShell
      kind="invoice"
      initialUpsellFeature={initialUpsellFeature}
      account={account}
    />
  );
}
