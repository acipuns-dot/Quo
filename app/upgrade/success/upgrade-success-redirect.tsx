"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AccountStatusResponse = {
  authenticated: boolean;
  plan: "free" | "premium" | null;
  redirectTo: string;
};

type UpgradeSuccessRedirectProps = {
  pollIntervalMs?: number;
};

export function UpgradeSuccessRedirect({
  pollIntervalMs = 2000,
}: UpgradeSuccessRedirectProps) {
  const router = useRouter();
  const [message, setMessage] = useState("Confirming your premium access...");

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    async function checkAccount() {
      try {
        const response = await fetch("/api/account", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Account check failed");
        }

        const account = (await response.json()) as AccountStatusResponse;

        if (cancelled) {
          return;
        }

        if (account.authenticated && account.plan === "premium") {
          router.replace("/workspace/invoice");
          return;
        }

        timeoutId = setTimeout(checkAccount, pollIntervalMs);
      } catch {
        if (cancelled) {
          return;
        }

        setMessage("Still syncing your account. You can wait here or open your workspace manually.");
        timeoutId = setTimeout(checkAccount, pollIntervalMs);
      }
    }

    void checkAccount();

    return () => {
      cancelled = true;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [pollIntervalMs, router]);

  return <p className="mt-4 text-sm text-white/45">{message}</p>;
}
