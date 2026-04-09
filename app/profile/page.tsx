import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "../../components/site/site-header";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { getWorkspaceAccountProfile, resolvePostAuthPath } from "../../lib/workspace/account-profiles";

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
    return null;
  }

  async function logout() {
    "use server";

    try {
      const logoutSupabase = await createSupabaseServerClient();
      await logoutSupabase.auth.signOut();
    } finally {
      redirect("/");
    }
  }

  const profile = await getWorkspaceAccountProfile(supabase, user.id);
  const plan = profile?.plan ?? "free";
  const documentsHref = resolvePostAuthPath(plan, "invoice");

  return (
    <>
      <SiteHeader account={{ authenticated: true, plan }} />
      <main className="min-h-screen bg-[linear-gradient(180deg,#111111_0%,#1e1408_100%)] px-6 py-16 text-white">
        <section className="mx-auto max-w-4xl rounded-[32px] border border-[#d4901e]/20 bg-[#18120d] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:p-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d4901e]/30 bg-[#d4901e]/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d4901e]">
            {plan === "premium" ? "Premium plan" : "Free plan"}
          </div>

          <h1 className="mt-8 text-4xl font-extrabold tracking-[-0.04em] text-white md:text-5xl">
            Your Quo profile
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/58">
            Keep track of your account access and jump back into the right Quo experience for your plan.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">Email</p>
              <p className="mt-3 text-lg font-semibold text-white">{user.email}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">Access</p>
              <p className="mt-3 text-lg font-semibold text-white">
                {plan === "premium" ? "Workspace access enabled" : "Free document flow"}
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm leading-7 text-white/65">
              {plan === "premium"
                ? "Your premium account unlocks the Quo workspace with saved customers, document history, and multi-business tools."
                : "You can keep using Quo for free, or upgrade when you want the full workspace with saved customers, history, and multi-business tools."}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {plan === "premium" ? (
                <Link
                  href="/workspace/invoice"
                  className="rounded-2xl bg-[#d4901e] px-5 py-3 text-sm font-bold text-[#111111]"
                >
                  Open Workspace
                </Link>
              ) : (
                <Link
                  href="/upgrade"
                  className="rounded-2xl bg-[#d4901e] px-5 py-3 text-sm font-bold text-[#111111]"
                >
                  Upgrade to Premium
                </Link>
              )}

              <Link
                href={documentsHref}
                className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/75"
              >
                Back to documents
              </Link>

              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/75 transition hover:border-white/20 hover:text-white"
                >
                  Log out
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
