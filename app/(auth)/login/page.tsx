import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "../../../components/auth/auth-form";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

export default async function LoginPage() {
  const hasSupabaseEnv = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  if (hasSupabaseEnv) {
    try {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        redirect("/profile");
      }
    } catch {
      // If Supabase is temporarily unavailable, keep the login page reachable.
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#111111_0%,#1e1408_100%)] text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-16">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70 transition hover:border-[#d4901e]/40 hover:text-white"
          >
            Back to home
          </Link>
        </div>
        <div className="flex flex-1 flex-col justify-center gap-12 lg:flex-row lg:items-center lg:gap-20">
        <section className="max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d4901e]/30 bg-[#d4901e]/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d4901e]">
            Premium workspace
          </div>
          <h1 className="mt-8 text-5xl font-extrabold tracking-[-0.04em] text-white">
            Business documents
            <br />
            <em className="font-[Instrument_Serif] font-normal italic text-[#d4901e]">
              ready in minutes
            </em>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-white/58">
            Sign in to keep your businesses, customers, and document history in one premium workspace while preserving the same fast Quodo editing flow.
          </p>
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/45">
            <span>Unlimited exports</span>
            <span>Reusable customers</span>
            <span>Business switching</span>
          </div>
        </section>

        <section className="w-full max-w-xl">
          <AuthForm
            disabled={!hasSupabaseEnv}
            reason={
              !hasSupabaseEnv
                ? "Premium login needs Supabase environment variables before sign-in can be enabled in this environment."
                : undefined
            }
          />
        </section>
        </div>
      </div>
    </main>
  );
}
