import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import {
  ensureWorkspaceAccountProfile,
  resolvePostAuthPath,
} from "../../../lib/workspace/account-profiles";

function resolveSafeKind(next: string | null) {
  if (next === "/quotation") return "quotation";
  if (next === "/receipt") return "receipt";
  return "invoice";
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next");
  const supabase = await createSupabaseServerClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  }

  const profile = await ensureWorkspaceAccountProfile(supabase, user);
  const kind = resolveSafeKind(requestedNext);
  const redirectTo = resolvePostAuthPath(profile.plan, kind);

  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
}
