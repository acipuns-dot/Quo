"use client";

import React, { useEffect, useState } from "react";
import type { DocumentKind } from "../../lib/documents/types";
import { DocumentGenerator } from "../generator/document-generator";
import { GoogleAdSenseAutoAds } from "../ads/google-adsense-auto-ads";
import { SiteHeader } from "../site/site-header";
import type { SiteHeaderAccount } from "../site/site-header";
import { PremiumUpsellModal } from "./premium-upsell-modal";

type UpsellFeature = "workspace" | "customers" | "history";

export function FreePlanShell({
  kind,
  initialUpsellFeature,
  account,
}: {
  kind: DocumentKind;
  initialUpsellFeature: UpsellFeature | null;
  account: SiteHeaderAccount;
}) {
  const [feature, setFeature] = useState<UpsellFeature | null>(initialUpsellFeature);

  useEffect(() => {
    setFeature(initialUpsellFeature);
  }, [initialUpsellFeature]);

  const isPremium = account.authenticated && account.plan === "premium";
  const shouldShowUpsellBanner = !isPremium;
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;
  const shouldShowAds = !isPremium && Boolean(publisherId);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#120d08]">
      {shouldShowAds ? <GoogleAdSenseAutoAds publisherId={publisherId!} /> : null}
      <SiteHeader account={account} />
      {shouldShowUpsellBanner ? (
        <div className="border-b border-[#3a2a18] bg-[linear-gradient(90deg,#1c140d_0%,#24170f_100%)] px-6 py-3 text-[#faf9f7]">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-[#d4901e]/35 bg-[#d4901e]/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d4901e]">
                Free plan
              </span>
              <p className="text-sm leading-6 text-white/78">
                Upgrade to Quo Premium to save repeat customer details, reopen document history, and manage multiple
                businesses in one workflow.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFeature("workspace")}
              className="rounded-2xl bg-[#d4901e] px-4 py-2.5 text-sm font-bold text-[#111111] shadow-[0_10px_30px_rgba(212,144,30,0.18)] transition hover:brightness-105"
            >
              Upgrade now
            </button>
          </div>
        </div>
      ) : null}
      <DocumentGenerator kind={kind} />
      <PremiumUpsellModal
        feature={feature ?? "workspace"}
        open={feature !== null}
        onClose={() => setFeature(null)}
      />
    </div>
  );
}
