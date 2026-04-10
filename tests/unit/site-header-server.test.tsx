import "@testing-library/jest-dom/vitest";
import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { createSupabaseServerClient } = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
}));
const { getWorkspaceAccountProfile } = vi.hoisted(() => ({
  getWorkspaceAccountProfile: vi.fn(),
}));
const siteHeaderSpy = vi.fn((props: unknown) => <div data-props={JSON.stringify(props)}>Header</div>);

vi.mock("../../lib/supabase/server", () => ({
  createSupabaseServerClient,
}));

vi.mock("../../lib/workspace/account-profiles", () => ({
  getWorkspaceAccountProfile,
}));

vi.mock("../../components/site/site-header", () => ({
  SiteHeader: (props: unknown) => siteHeaderSpy(props),
}));

describe("SiteHeaderServer", () => {
  it("falls back to a logged-out header when Supabase user lookup throws", async () => {
    createSupabaseServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockRejectedValue(new Error("supabase unavailable")),
      },
    });

    const siteHeaderServerModule = await import("../../components/site/site-header-server");
    const view = await siteHeaderServerModule.SiteHeaderServer();
    render(view);

    expect(siteHeaderSpy).toHaveBeenCalledWith({
      account: {
        authenticated: false,
        plan: null,
      },
    });
    expect(getWorkspaceAccountProfile).not.toHaveBeenCalled();
  });
});
