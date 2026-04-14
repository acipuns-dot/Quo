import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import {
  ensureWorkspaceAccountProfile,
  resolvePostAuthPath,
} from "../../../lib/workspace/account-profiles";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ authenticated: false, plan: null, redirectTo: "/login" });
    }

    const profile = await ensureWorkspaceAccountProfile(supabase, user);

    return NextResponse.json({
      authenticated: true,
      plan: profile.plan,
      redirectTo: resolvePostAuthPath(profile.plan, "invoice"),
    });
  } catch {
    return NextResponse.json({ authenticated: false, plan: null, redirectTo: "/login" });
  }
}
