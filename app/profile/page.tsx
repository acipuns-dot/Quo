import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "../../components/site/site-header";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { getWorkspaceAccountProfile, resolvePostAuthPath } from "../../lib/workspace/account-profiles";
import { CancelSubscriptionButton } from "./cancel-subscription-button";

export default async function ProfilePage() {
  let user: { id: string; email?: string | null } | null = null;
  let plan: "free" | "premium" = "free";
  let subscription: {
    plan_interval: string;
    status: string;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
  } | null = null;

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user: authedUser },
    } = await supabase.auth.getUser();

    if (!authedUser) {
      redirect("/login");
    }

    user = authedUser;
    const profile = await getWorkspaceAccountProfile(supabase, authedUser.id);
    plan = profile?.plan ?? "free";

    if (plan === "premium") {
      const { data } = await supabase
        .from("billing_subscriptions")
        .select("plan_interval, status, current_period_end, cancel_at_period_end")
        .eq("user_id", authedUser.id)
        .eq("provider", "paypal")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      subscription = data ?? null;
    }
  } catch {
    redirect("/login");
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

  const documentsHref = resolvePostAuthPath(plan, "invoice");

  const periodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <>
      <SiteHeader account={{ authenticated: true, plan }} />
      <main className="min-h-screen bg-[linear-gradient(180deg,#111111_0%,#1e1408_100%)] px-6 py-16 text-white">
        <section className="mx-auto max-w-4xl rounded-[32px] border border-[#d4901e]/20 bg-[#18120d] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:p-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d4901e]/30 bg-[#d4901e]/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d4901e]">
            {plan === "premium" ? "Premium plan" : "Free plan"}
          </div>

          <h1 className="mt-8 text-4xl font-extrabold tracking-[-0.04em] text-white md:text-5xl">
            Your Quodo profile
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/58">
            Keep track of your account access and jump back into the right Quodo experience for your plan.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">Email</p>
              <p className="mt-3 text-lg font-semibold text-white">{user?.email ?? "Unknown email"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">Access</p>
              <p className="mt-3 text-lg font-semibold text-white">
                {plan === "premium" ? "Premium" : "Free"}
              </p>
            </div>
          </div>

          {/* Subscription details for premium users */}
          {plan === "premium" && subscription ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">Subscription</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                <span className="text-sm font-semibold text-white capitalize">
                  {subscription.plan_interval} · {subscription.status.toLowerCase()}
                </span>
                {periodEnd ? (
                  <span className="text-sm text-white/50">
                    {subscription.cancel_at_period_end
                      ? `Cancels on ${periodEnd}`
                      : `Renews ${periodEnd}`}
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm leading-7 text-white/65">
              {plan === "premium"
                ? "Your premium account unlocks the Quodo workspace with saved customers, document history, and multi-business tools."
                : "You can keep using Quodo for free, or upgrade when you want the full workspace with saved customers, history, and multi-business tools."}
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

              {plan !== "premium" ? (
                <Link
                  href={documentsHref}
                  className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/75"
                >
                  Back to documents
                </Link>
              ) : null}

              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/75 transition hover:border-white/20 hover:text-white"
                >
                  Log out
                </button>
              </form>
            </div>

            {plan === "premium" && subscription && !subscription.cancel_at_period_end ? (
              <div className="mt-6 border-t border-white/8 pt-6">
                <CancelSubscriptionButton />
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </>
  );
}
