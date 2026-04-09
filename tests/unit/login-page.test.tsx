import "@testing-library/jest-dom/vitest";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const { createSupabaseServerClient } = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
}));
const { getWorkspaceAccountProfile } = vi.hoisted(() => ({
  getWorkspaceAccountProfile: vi.fn(),
}));
const redirect = vi.fn();

vi.mock("../../lib/supabase/server", () => ({
  createSupabaseServerClient,
}));

vi.mock("../../lib/workspace/account-profiles", () => ({
  getWorkspaceAccountProfile,
  resolvePostAuthPath: (plan: "free" | "premium") =>
    plan === "premium" ? "/workspace/invoice" : "/invoice",
}));

vi.mock("next/navigation", () => ({
  redirect,
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("login page", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  it("redirects signed-in premium users to the workspace entry route", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";

    createSupabaseServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user_1" } },
        }),
      },
    });
    getWorkspaceAccountProfile.mockResolvedValue({ plan: "premium" });

    const loginPageModule = await import("../../app/(auth)/login/page");
    await loginPageModule.default();

    expect(redirect).toHaveBeenCalledWith("/workspace/invoice");
  });

  it("keeps signed-in free users on the login page instead of redirecting to workspace", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";

    createSupabaseServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user_1" } },
        }),
      },
      from: vi.fn(),
    });
    getWorkspaceAccountProfile.mockResolvedValue({ plan: "free" });

    const loginPageModule = await import("../../app/(auth)/login/page");
    const view = await loginPageModule.default();

    expect(redirect).not.toHaveBeenCalled();
    expect(view).toBeTruthy();
  });

  it("renders a setup message instead of the auth form when Supabase env is missing", async () => {
    const loginPageModule = await import("../../app/(auth)/login/page");
    const view = await loginPageModule.default();

    render(view);

    expect(
      screen.getByText(/premium login needs supabase environment variables/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Create account tab" })).toBeDisabled();
  });

  it("renders the login page instead of crashing when Supabase user lookup throws", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";

    createSupabaseServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockRejectedValue(new Error("supabase unavailable")),
      },
    });

    const loginPageModule = await import("../../app/(auth)/login/page");
    const view = await loginPageModule.default();

    render(view);

    expect(redirect).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: /sign in to quo premium/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
  });
});
