"use client";

import React, { useEffect, useState } from "react";
import type { DocumentKind } from "../../lib/documents/types";
import { DocumentGenerator } from "../generator/document-generator";
import { SiteHeader } from "../site/site-header";
import { PremiumUpsellModal } from "./premium-upsell-modal";

type UpsellFeature = "workspace" | "customers" | "history";

export function FreePlanShell({
  kind,
  initialUpsellFeature,
  account,
}: {
  kind: DocumentKind;
  initialUpsellFeature: UpsellFeature | null;
  account: { authenticated: boolean; plan: "free" | "premium" | null };
}) {
  const [feature, setFeature] = useState<UpsellFeature | null>(initialUpsellFeature);

  useEffect(() => {
    setFeature(initialUpsellFeature);
  }, [initialUpsellFeature]);

  const isSignedInFree = account.authenticated && account.plan === "free";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#120d08]">
      <SiteHeader />
      {isSignedInFree ? (
        <div className="border-b border-[#2b231c] bg-[#18120d] px-6 py-3 text-[#faf9f7]">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
            <span className="rounded-full border border-[#d4901e]/30 bg-[#d4901e]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d4901e]">
              Free account
            </span>
            <button
              type="button"
              onClick={() => setFeature("workspace")}
              className="text-sm text-white/75"
            >
              Multi-business workspace
            </button>
            <button
              type="button"
              onClick={() => setFeature("customers")}
              className="text-sm text-white/75"
            >
              Saved customers
            </button>
            <button
              type="button"
              onClick={() => setFeature("history")}
              className="text-sm text-white/75"
            >
              Document history
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
