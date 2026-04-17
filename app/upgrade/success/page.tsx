import { redirect } from "next/navigation";
import { SiteHeaderServer } from "../../../components/site/site-header-server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { getWorkspaceAccountProfile } from "../../../lib/workspace/account-profiles";
import { UpgradeSuccessRedirect } from "./upgrade-success-redirect";

export default async function UpgradeSuccessPage() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const profile = await getWorkspaceAccountProfile(supabase, user.id);

      if (profile?.plan === "premium") {
        redirect("/workspace/invoice");
      }
    }
  } catch {
    // Keep the success page usable even if account reconciliation is still in flight.
  }

  return (
    <>
      <SiteHeaderServer />
      <main className="min-h-screen bg-[#120d08] px-6 py-16 text-[#faf9f7]">
        <section className="mx-auto max-w-2xl rounded-[32px] border border-[#d4901e]/20 bg-[#18120d] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:p-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#d4901e]/15">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="#d4901e" fillOpacity="0.2" />
              <path d="M9 16.5l4.5 4.5 9.5-9.5" stroke="#d4901e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d4901e]">Success</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] text-white md:text-4xl">
            Welcome to Quo Premium
          </h1>
          <p className="mt-4 text-base leading-7 text-white/60">
            Your subscription is being activated. We will send you to the premium workspace as soon as your account finishes syncing.
          </p>
          <UpgradeSuccessRedirect />
        </section>
      </main>
    </>
  );
}
