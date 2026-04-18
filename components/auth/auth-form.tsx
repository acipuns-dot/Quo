"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";

type AuthMode = "sign-in" | "sign-up" | "forgot-password";

async function resolveAuthenticatedRedirect() {
  const response = await fetch("/api/account", { method: "GET" });

  if (!response.ok) {
    throw new Error("Unable to resolve your account plan.");
  }

  const payload = (await response.json()) as { redirectTo: string };
  return payload.redirectTo;
}

export function AuthForm({
  disabled = false,
  reason,
}: {
  disabled?: boolean;
  reason?: string;
}) {
  const router = useRouter();
  const supabase = useMemo(() => {
    if (disabled) {
      return null;
    }

    return createSupabaseBrowserClient();
  }, [disabled]);
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleEmailAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      if (!supabase) {
        throw new Error(reason ?? "Premium login is currently unavailable.");
      }

      if (mode === "forgot-password") {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (resetError) throw resetError;
        setMessage("Check your email for a password reset link.");
        return;
      }

      if (mode === "sign-in") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          throw signInError;
        }

        const redirectTo = await resolveAuthenticatedRedirect();
        router.push(redirectTo);
        router.refresh();
        return;
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/workspace/invoice")}`;
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo,
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.session) {
        const redirectTo = await resolveAuthenticatedRedirect();
        router.push(redirectTo);
        router.refresh();
        return;
      }

      setMessage("Check your email for a confirmation link to finish creating your account.");
    } catch (caughtError) {
      const nextError =
        caughtError instanceof Error ? caughtError.message : "Something went wrong. Please try again.";
      setError(nextError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full rounded-[28px] border border-white/10 bg-[#18120d]/95 p-8 text-[#faf9f7] shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d4901e]/30 bg-[#d4901e]/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d4901e]">
        Premium workspace
      </div>

      <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-white">
        Sign in to Quodo Premium
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-white/58">
        Save businesses, customers, and document history across devices with the same polished workflow as the main site.
      </p>

      {reason ? (
        <div className="mt-5 rounded-2xl border border-[#d4901e]/30 bg-[#d4901e]/10 px-4 py-3 text-sm text-[#f7d58f]">
          {reason}
        </div>
      ) : null}

      {mode !== "forgot-password" && (
        <div className="mt-8 grid grid-cols-2 gap-2 rounded-2xl border border-white/8 bg-white/5 p-1">
          <button
            type="button"
            aria-label="Sign in tab"
            onClick={() => { setMode("sign-in"); setError(null); setMessage(null); setConfirmPassword(""); }}
            aria-pressed={mode === "sign-in"}
            disabled={disabled}
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
              mode === "sign-in" ? "bg-[#d4901e] text-[#111111]" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            aria-label="Create account tab"
            onClick={() => { setMode("sign-up"); setError(null); setMessage(null); setConfirmPassword(""); }}
            aria-pressed={mode === "sign-up"}
            disabled={disabled}
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
              mode === "sign-up" ? "bg-[#d4901e] text-[#111111]" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            Create account
          </button>
        </div>
      )}

      {mode === "forgot-password" && (
        <div className="mt-8">
          <button
            type="button"
            onClick={() => { setMode("sign-in"); setError(null); setMessage(null); setConfirmPassword(""); }}
            className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to sign in
          </button>
          <h2 className="mt-4 text-xl font-bold text-white">Reset your password</h2>
          <p className="mt-1 text-sm text-white/50">Enter your email and we&apos;ll send you a reset link.</p>
        </div>
      )}

      <form className="mt-6 space-y-4" onSubmit={handleEmailAuth}>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
            Email
          </span>
          <input
            aria-label="Email"
            type="email"
            required
            disabled={disabled}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#d4901e] focus:outline-none focus:ring-2 focus:ring-[#d4901e]/20"
            placeholder="owner@example.com"
          />
        </label>

        {mode !== "forgot-password" && (
          <>
            <label className="block">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                  Password
                </span>
                {mode === "sign-in" && (
                  <button
                    type="button"
                    onClick={() => { setMode("forgot-password"); setError(null); setMessage(null); }}
                    className="text-xs text-[#d4901e]/70 hover:text-[#d4901e] transition"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                aria-label="Password"
                type="password"
                required
                minLength={6}
                disabled={disabled}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#d4901e] focus:outline-none focus:ring-2 focus:ring-[#d4901e]/20"
                placeholder="At least 6 characters"
              />
            </label>

            {mode === "sign-up" && (
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                  Confirm password
                </span>
                <input
                  aria-label="Confirm password"
                  type="password"
                  required
                  minLength={6}
                  disabled={disabled}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#d4901e] focus:outline-none focus:ring-2 focus:ring-[#d4901e]/20"
                  placeholder="Repeat your password"
                />
              </label>
            )}
          </>
        )}

        {error ? (
          <div className="rounded-2xl border border-[#dc2626]/30 bg-[#dc2626]/10 px-4 py-3 text-sm text-[#fecaca]">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-2xl border border-[#d4901e]/30 bg-[#d4901e]/10 px-4 py-3 text-sm text-[#f7d58f]">
            {message}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={disabled || isSubmitting}
          className="relative w-full rounded-2xl bg-[#d4901e] px-5 py-3.5 text-sm font-bold text-[#111111] shadow-[0_10px_30px_rgba(212,144,30,0.28)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {mode === "sign-in" ? "Signing in…" : mode === "forgot-password" ? "Sending…" : "Creating account…"}
            </span>
          ) : mode === "sign-in" ? "Sign in" : mode === "forgot-password" ? "Send reset link" : "Create account"}
        </button>
      </form>
    </div>
  );
}
