import React from "react";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { getWorkspaceAccountProfile } from "../../lib/workspace/account-profiles";
import { SiteHeader, type SiteHeaderAccount } from "./site-header";

export async function SiteHeaderServer() {
  const hasSupabaseEnv = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  let account: SiteHeaderAccount = {
    authenticated: false,
    plan: null,
  };

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

  return <SiteHeader account={account} />;
}
