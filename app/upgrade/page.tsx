import Link from "next/link";
import { SiteHeader } from "../../components/site/site-header";

const premiumBenefits = [
  "Multi-business workspace",
  "Saved customers for repeat jobs",
  "Document history for drafts and exports",
  "Continue work across devices",
];

export default function UpgradePage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#120d08] px-6 py-16 text-[#faf9f7]">
        <section className="mx-auto max-w-4xl rounded-[32px] border border-[#d4901e]/20 bg-[#18120d] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:p-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d4901e]">Upgrade</p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.04em] text-white md:text-5xl">
            Quo Premium keeps your document workflow organized.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/68">
            Unlock the full premium workspace to manage multiple businesses, save repeat customer details, and
            reopen drafts or exported documents whenever you need them.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {premiumBenefits.map((benefit) => (
              <div
                key={benefit}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-white/88"
              >
                {benefit}
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-[#d4901e]/20 bg-[#d4901e]/10 px-5 py-4 text-sm leading-7 text-[#f7d58f]">
            Payments are the next piece being wired. This page is ready to become the checkout entry point once
            PayPal is connected.
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/login" className="rounded-2xl bg-[#d4901e] px-5 py-3 text-sm font-bold text-[#111111]">
              Sign in for Premium
            </Link>
            <Link
              href="/invoice"
              className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/75"
            >
              Keep using free
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
