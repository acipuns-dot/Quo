import { beforeEach, describe, expect, it, vi } from "vitest";

const { createSupabaseServerClient } = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
}));
const { ensureWorkspaceAccountProfile } = vi.hoisted(() => ({
  ensureWorkspaceAccountProfile: vi.fn(),
}));

vi.mock("../../lib/supabase/server", () => ({
  createSupabaseServerClient,
}));

vi.mock("../../lib/workspace/account-profiles", () => ({
  ensureWorkspaceAccountProfile,
  resolvePostAuthPath: (plan: "free" | "premium") =>
    plan === "premium" ? "/workspace/invoice" : "/invoice",
}));

describe("auth callback route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects free users into the free app after OAuth", async () => {
    createSupabaseServerClient.mockResolvedValue({
      auth: {
        exchangeCodeForSession: vi.fn().mockResolvedValue({}),
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user_1" } },
        }),
      },
    });
    ensureWorkspaceAccountProfile.mockResolvedValue({ plan: "free" });

    const route = await import("../../app/auth/callback/route");
    const response = await route.GET(
      new Request("http://localhost:3000/auth/callback?code=test-code"),
    );

    expect(response.headers.get("location")).toBe("http://localhost:3000/invoice");
  });
});
