import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { getWorkspaceAccountProfile } from "../../lib/workspace/account-profiles";
import { SiteHeaderServer } from "../../components/site/site-header-server";
import { UpgradeButtons } from "./upgrade-buttons";

const premiumBenefits = [
  "Unlimited PDF exports",
  "No ads",
  "Multi-business workspace",
  "Saved customers",
  "Document history",
  "Item catalogue",
  "Full template library",
];

export default async function UpgradePage() {
  let shouldRedirectToWorkspace = false;

  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const profile = await getWorkspaceAccountProfile(supabase, user.id);
      shouldRedirectToWorkspace = profile?.plan === "premium";
    }
  } catch {
    // allow page to render if session check fails
  }

  if (shouldRedirectToWorkspace) {
    redirect("/workspace/invoice");
  }

  return (
    <>
      <SiteHeaderServer />
      <main className="min-h-screen bg-[#120d08] px-6 py-16 text-[#faf9f7]">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">

            {/* Left — pitch */}
            <div className="lg:pt-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d4901e]">
                Upgrade to Premium
              </p>
              <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.04em] text-white md:text-5xl">
                Keep your document workflow organized.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-white/60">
                Manage multiple businesses, save repeat customer details, and reopen
                drafts or exported documents whenever you need them.
              </p>

              <ul className="mt-10 flex flex-col gap-4">
                {premiumBenefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#d4901e]/15">
                      <svg
                        className="h-3 w-3 text-[#d4901e]"
                        fill="none"
                        viewBox="0 0 12 12"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    </span>
                    <span className="text-sm font-medium text-white/80">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — pricing card */}
            <div className="rounded-[28px] border border-[#d4901e]/25 bg-[#18120d] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
              <UpgradeButtons />
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
