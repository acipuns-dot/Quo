import "@testing-library/jest-dom/vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
}));

vi.mock("../../components/site/site-header", () => ({
  SiteHeader: () => <div>Header</div>,
}));

vi.mock("next/navigation", () => ({
  redirect,
  usePathname: () => "/profile",
}));

describe("profile page", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("redirects unauthenticated users to login", async () => {
    createSupabaseServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
    });

    const profilePageModule = await import("../../app/profile/page");
    await profilePageModule.default();

    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("renders the free plan profile state with upgrade and logout actions", async () => {
    createSupabaseServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user_1", email: "owner@example.com" } },
        }),
      },
    });
    getWorkspaceAccountProfile.mockResolvedValue({ plan: "free" });

    const profilePageModule = await import("../../app/profile/page");
    const view = await profilePageModule.default();

    render(view);

    expect(screen.getByText(/owner@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/free plan/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /upgrade to premium/i })).toHaveAttribute("href", "/upgrade");
    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
  });

  it("renders the premium profile state with workspace and logout actions", async () => {
    createSupabaseServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user_1", email: "owner@example.com" } },
        }),
      },
    });
    getWorkspaceAccountProfile.mockResolvedValue({ plan: "premium" });

    const profilePageModule = await import("../../app/profile/page");
    const view = await profilePageModule.default();

    render(view);

    expect(screen.getByText(/premium plan/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open workspace/i })).toHaveAttribute("href", "/workspace/invoice");
    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
  });
});
