import React from "react";
import Link from "next/link";
import { SiteHeaderServer } from "../components/site/site-header-server";

const docTypes = [
  {
    href: "/quotation",
    label: "Quotation",
    when: "Before work begins",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
  },
  {
    href: "/invoice",
    label: "Invoice",
    when: "After work is done",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
      </svg>
    ),
  },
  {
    href: "/receipt",
    label: "Receipt",
    when: "Once payment is received",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l1.5 1.5 3-3.75M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9Z" />
      </svg>
    ),
  },
];

const reasons = [
  {
    title: "Done in under 2 minutes",
    description: "Fill in your details, see it live, download the PDF. No setup, no learning curve.",
    icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
  },
  {
    title: "Looks professional instantly",
    description: "Clean layouts that make your business look established — without hiring a designer.",
    icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" /></svg>,
  },
  {
    title: "No software to install",
    description: "Works in your browser on any device. Open it, make your document, move on.",
    icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3" /></svg>,
  },
  {
    title: "Not accounting software",
    description: "Quo does one thing well: simple client documents. No ledgers, no dashboards, no bloat.",
    icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>,
  },
];

const faqs = [
  { q: "What does the free plan include?", a: "Unlimited document exports across invoices, quotations, and receipts — no account required. All core features are available on the free plan." },
  { q: "What do paid members get?", a: "Everything in free, plus no ads, multi-business workspace, saved customers, document history, item catalogue, and the full template library." },
  { q: "Are ads shown on paid plans?", a: "No. Ads are only shown on the free plan, and only within the app — never inside your exported documents." },
  { q: "Do I need to create an account?", a: "No account is needed to start. Sign up is optional and only required if you want to save documents or access a paid plan." },
];

export default function HomePage() {
  return (
    <>
      <SiteHeaderServer />

      {/* ── 1. Hero — centered minimal ── */}
      <section className="quo-hero relative overflow-hidden text-center">
        <div className="quo-hero-glow" />
        <div className="relative max-w-4xl mx-auto px-6 py-24 lg:py-36">
          {/* Badge */}
          <div className="animate-fade-in inline-flex items-center gap-2 quo-badge text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full border mb-8">
            <span className="quo-badge-dot w-1.5 h-1.5 rounded-full flex-shrink-0" />
            Free to start · no setup needed
          </div>

          {/* Headline */}
          <h1 className="animate-slide-up delay-100 quo-headline block mb-6">
            Business documents<br />
            <em className="quo-headline-em">ready in minutes</em>
          </h1>

          {/* Subtext */}
          <p className="animate-slide-up delay-200 quo-subtext text-lg leading-relaxed max-w-md mx-auto mb-10">
            Quotations, invoices, and receipts for small businesses. Live preview, instant PDF.
          </p>

          {/* CTAs */}
          <div className="animate-slide-up delay-300 flex items-center justify-center gap-3 flex-wrap mb-12">
            <Link href="/invoice" className="quo-cta-btn inline-flex items-center gap-2.5 rounded-lg px-6 py-3 text-sm font-bold text-white transition-all duration-200 active:scale-95">
              Start free
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link href="#how-it-works" className="quo-ghost-btn inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-medium transition-all duration-200">
              See how it works
            </Link>
          </div>

          {/* Proof points */}
          <div className="animate-fade-in delay-500 flex items-center justify-center gap-6 flex-wrap">
            {["10 free exports daily", "Quotation · Invoice · Receipt", "Upgrade for unlimited"].map((pt) => (
              <span key={pt} className="quo-proof-point inline-flex items-center gap-1.5 text-xs">
                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                {pt}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. Doc type cards — tight below fold ── */}
      <div className="quo-hero-docs">
        <div className="max-w-6xl mx-auto px-6 pt-10 pb-14 lg:pt-12 lg:pb-16">
          <div className="grid grid-cols-3 gap-4">
            {docTypes.map((doc, i) => (
              <Link
                key={doc.href}
                href={doc.href}
                className={`animate-scale-in quo-doc-mini group flex items-center gap-4 rounded-xl px-5 py-4 border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="quo-doc-mini-icon w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  {doc.icon}
                </div>
                <div className="min-w-0">
                  <div className="quo-doc-mini-label font-bold text-sm text-white">{doc.label}</div>
                  <div className="quo-doc-mini-when text-xs mt-1">{doc.when}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. How it works ── */}
      <section id="how-it-works" className="quo-preview-section">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="animate-slide-up text-center mb-12">
            <p className="quo-eyebrow text-xs font-semibold uppercase tracking-widest mb-2">How it works</p>
            <h2 className="quo-heading-dark text-3xl font-bold">Simple from start to PDF</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { n: "1", title: "Choose your document", desc: "Pick quotation, invoice, or receipt — each tailored to the right stage of a client job." },
              { n: "2", title: "Fill in your details", desc: "Add your business info, client details, line items, and notes. The preview updates live as you type." },
              { n: "3", title: "Download the PDF", desc: "Hit export and get a pixel-perfect, print-ready PDF instantly. No server, no waiting." },
            ].map((s, i) => (
              <div key={s.n} className="animate-scale-in quo-step-card rounded-xl p-7 border" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="quo-step-num w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm mb-5">{s.n}</div>
                <h3 className="quo-step-title font-bold text-sm mb-2">{s.title}</h3>
                <p className="quo-step-desc text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Why Quo ── */}
      <section className="quo-why-section">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="animate-slide-up mb-12">
            <p className="quo-eyebrow-inv text-xs font-semibold uppercase tracking-widest mb-2">Why Quo</p>
            <h2 className="quo-heading-light text-3xl font-bold">Built for busy owners,<br />not accountants</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {reasons.map((r, i) => (
              <div key={r.title} className="animate-scale-in quo-reason-card rounded-xl p-6 border transition-all duration-300 hover:-translate-y-1" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="quo-reason-icon w-9 h-9 rounded-lg flex items-center justify-center mb-4">{r.icon}</div>
                <h3 className="quo-reason-title font-bold text-sm mb-2">{r.title}</h3>
                <p className="quo-reason-desc text-sm leading-relaxed">{r.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Document types ── */}
      <section className="quo-docs-section">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="animate-slide-up text-center mb-12">
            <p className="quo-eyebrow text-xs font-semibold uppercase tracking-widest mb-2">Document types</p>
            <h2 className="quo-heading-dark text-3xl font-bold">The right document for every stage</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { href: "/quotation", label: "Quotation", when: "Before work begins", desc: "Send a clear, itemised price estimate so clients know exactly what to expect.", icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg> },
              { href: "/invoice", label: "Invoice", when: "After work is done", desc: "Bill clients for completed work or delivered goods with a clean, professional invoice.", icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" /></svg> },
              { href: "/receipt", label: "Receipt", when: "Once payment is received", desc: "Give clients a professional record of payment and close the transaction cleanly.", icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l1.5 1.5 3-3.75M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9Z" /></svg> },
            ].map((doc, i) => (
              <Link key={doc.href} href={doc.href} className="animate-scale-in quo-doc-tile group rounded-xl p-7 border block h-full flex flex-col transition-all duration-200 hover:-translate-y-1" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="quo-doc-tile-icon w-11 h-11 rounded-lg flex items-center justify-center mb-5">{doc.icon}</div>
                <p className="quo-doc-when text-xs font-bold uppercase tracking-widest mb-1.5">{doc.when}</p>
                <h3 className="quo-doc-label font-bold text-xl mb-2">{doc.label}</h3>
                <p className="quo-doc-desc text-sm leading-relaxed mb-5">{doc.desc}</p>
                <span className="quo-doc-link inline-flex items-center gap-1.5 text-xs font-bold transition-all duration-150 group-hover:gap-2.5 mt-auto">
                  Create {doc.label}
                  <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Plans ── */}
      <section id="plans" className="quo-plans-section">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <div className="animate-slide-up text-center mb-12">
            <p className="quo-eyebrow-inv text-xs font-semibold uppercase tracking-widest mb-2">Plans</p>
            <h2 className="quo-heading-light text-3xl font-bold">Free to start.<br />Upgrade when you need more.</h2>
            <p className="quo-plans-sub mt-3 text-sm max-w-sm mx-auto leading-relaxed">No pressure. Start today and upgrade only when the free plan stops being enough.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Free */}
            <div className="animate-scale-in delay-100 quo-plan-free rounded-2xl p-8 border flex flex-col">
              <p className="quo-plan-label text-xs font-bold uppercase tracking-widest mb-1">Free</p>
              <p className="quo-plan-price text-4xl font-bold mb-1">$0</p>
              <p className="quo-plan-subdesc text-sm mb-7" style={{ minHeight: "2.5rem" }}>No account needed. Start right away.</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {["Unlimited PDF exports", "Quotation, Invoice & Receipt", "Live PDF preview", "Ad-supported"].map((item) => (
                  <li key={item} className="quo-plan-item flex items-start gap-2.5 text-sm">
                    <svg className="flex-shrink-0 mt-0.5" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/invoice" className="quo-plan-cta-free block text-center rounded-lg px-5 py-3 text-sm font-bold transition-all duration-150">Start free</Link>
            </div>
            {/* Paid */}
            <div className="animate-scale-in delay-200 quo-plan-paid rounded-2xl p-8 border relative overflow-hidden flex flex-col">
              <div className="quo-plan-badge absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full">Best for regular use</div>
              <p className="quo-plan-label-paid text-xs font-bold uppercase tracking-widest mb-1">Premium</p>
              <p className="quo-plan-price-paid text-4xl font-bold mb-1">$4.99<span className="text-base font-medium opacity-70"> / mo</span></p>
              <p className="quo-plan-subdesc-paid text-sm mb-7" style={{ minHeight: "2.5rem" }}>or $49.90 / year &mdash; for businesses that run on Quo</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {["Unlimited PDF exports", "No ads", "Multi-business workspace", "Saved customers", "Document history", "Item catalogue", "Full template library"].map((item) => (
                  <li key={item} className="quo-plan-item-paid flex items-start gap-2.5 text-sm">
                    <svg className="flex-shrink-0 mt-0.5" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/upgrade" className="quo-plan-cta-paid block text-center rounded-lg px-5 py-3 text-sm font-bold transition-all duration-150">Upgrade now</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Trust ── */}
      <section className="quo-trust-section">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="animate-slide-up text-center mb-12">
            <p className="quo-eyebrow text-xs font-semibold uppercase tracking-widest mb-2">Built with care</p>
            <h2 className="quo-heading-dark text-3xl font-bold">Reliable enough for your business</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Professional output", desc: "Every document is designed to look like it came from an established business." },
              { title: "Works in your browser", desc: "No download, no install. Open a tab, create your document, close the tab." },
              { title: "Privacy-conscious", desc: "Your document data stays in your browser. It is not sent to any server." },
              { title: "No unnecessary steps", desc: "No account needed to start. No onboarding flow. Just the tool." },
            ].map((t, i) => (
              <div key={t.title} className="animate-scale-in quo-trust-card rounded-xl p-6 border" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="quo-trust-dot w-2 h-2 rounded-full mb-4" />
                <h3 className="quo-trust-title font-bold text-sm mb-2">{t.title}</h3>
                <p className="quo-trust-desc text-sm leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. FAQ ── */}
      <section id="faq" className="quo-faq-section">
        <div className="max-w-xl mx-auto px-6 py-20">
          <div className="animate-slide-up text-center mb-12">
            <p className="quo-eyebrow-inv text-xs font-semibold uppercase tracking-widest mb-2">FAQ</p>
            <h2 className="quo-heading-light text-3xl font-bold">Common questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={faq.q} className="animate-slide-up quo-faq-item rounded-xl p-6 border" style={{ animationDelay: `${i * 60}ms` }}>
                <h3 className="quo-faq-q font-bold text-sm mb-2">{faq.q}</h3>
                <p className="quo-faq-a text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. Final CTA ── */}
      <section className="quo-final-section text-center">
        <div className="max-w-xl mx-auto px-6 py-24">
          <h2 className="animate-slide-up quo-final-heading text-4xl font-bold mb-4 leading-tight">
            Create your first<br /><em className="quo-final-em">document now</em>
          </h2>
          <p className="animate-slide-up delay-100 quo-final-sub text-lg mb-9 leading-relaxed">Start free. No account needed. Upgrade later if you need more.</p>
          <div className="animate-slide-up delay-200">
            <Link href="/invoice" className="quo-cta-btn inline-flex items-center gap-2.5 rounded-lg px-7 py-3.5 text-sm font-bold text-white transition-all duration-200 active:scale-95">
              Start free
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
          <p className="animate-fade-in delay-400 quo-final-note text-xs mt-5">Free forever · No account required · No credit card</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="quo-footer border-t py-8 text-center text-xs">
        QUO · Free business document generator · Your data stays in your browser.
      </footer>
    </>
  );
}
