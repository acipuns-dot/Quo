import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthForm } from "../../components/auth/auth-form";

const push = vi.fn();
const refresh = vi.fn();
const signInWithPassword = vi.fn();
const signUp = vi.fn();
const signInWithOAuth = vi.fn();
const fetchMock = vi.fn();

vi.mock("../../lib/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      signInWithPassword,
      signUp,
      signInWithOAuth,
    },
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    refresh,
  }),
}));

describe("AuthForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
    signInWithPassword.mockResolvedValue({ data: {}, error: null });
    signUp.mockResolvedValue({ data: { session: null }, error: null });
    signInWithOAuth.mockResolvedValue({ data: {}, error: null });
  });

  it("signs in with email and password in sign-in mode", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ authenticated: true, plan: "premium", redirectTo: "/workspace/invoice" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    render(<AuthForm />);

    await user.type(screen.getByLabelText("Email"), "owner@example.com");
    await user.type(screen.getByLabelText("Password"), "super-secret");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "owner@example.com",
      password: "super-secret",
    });
    expect(push).toHaveBeenCalledWith("/workspace/invoice");
    expect(refresh).toHaveBeenCalled();
  });

  it("creates an account in sign-up mode", async () => {
    const user = userEvent.setup();
    render(<AuthForm />);

    await user.click(screen.getByRole("button", { name: "Create account tab" }));
    await user.type(screen.getByLabelText("Email"), "owner@example.com");
    await user.type(screen.getByLabelText("Password"), "super-secret");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(signUp).toHaveBeenCalledWith({
      email: "owner@example.com",
      password: "super-secret",
    });
    expect(
      screen.getByText(/check your email for a confirmation link/i),
    ).toBeInTheDocument();
  });

  it("starts Google sign-in with the auth callback route", async () => {
    const user = userEvent.setup();
    render(<AuthForm />);

    await user.click(screen.getByRole("button", { name: /continue with google/i }));

    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=%2Fworkspace%2Finvoice`,
      },
    });
  });

  it("routes signed-in free users into the free invoice flow", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ authenticated: true, plan: "free", redirectTo: "/invoice" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    signInWithPassword.mockResolvedValue({ error: null });

    render(<AuthForm />);

    await user.type(screen.getByLabelText(/email/i), "owner@example.com");
    await user.type(screen.getByLabelText(/password/i), "hunter2");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(push).toHaveBeenCalledWith("/invoice");
  });

  it("shows a friendly message when auth is unavailable", () => {
    render(<AuthForm disabled reason="Premium login needs Supabase environment variables." />);

    expect(
      screen.getByText("Premium login needs Supabase environment variables."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue with google/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeDisabled();
  });
});
