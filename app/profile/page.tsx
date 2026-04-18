import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "../../components/site/site-header";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { getWorkspaceAccountProfile, resolvePostAuthPath } from "../../lib/workspace/account-profiles";
import { CancelSubscriptionButton } from "./cancel-subscription-button";
import { CopyUserId } from "./copy-user-id";

export default async function ProfilePage() {
  let user: { id: string; email?: string | null } | null = null;
  let plan: "free" | "premium" = "free";
  let shortId: string | null = null;
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
    shortId = profile?.shortId ?? null;

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
            <CopyUserId shortId={shortId} />
            <a
              href="https://discord.gg/rHjSC2cJpm"
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-5 flex items-center gap-4 transition hover:border-white/20"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#5865F2]/15 text-[#5865F2]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.031.057a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Join our Discord</p>
                <p className="mt-0.5 text-xs text-white/40">Get help, share feedback, and stay updated</p>
              </div>
              <svg className="ml-auto h-4 w-4 shrink-0 text-white/25" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 3l5 5-5 5" />
              </svg>
            </a>
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
