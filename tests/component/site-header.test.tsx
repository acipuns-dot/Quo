import "@testing-library/jest-dom/vitest";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SiteHeader } from "../../components/site/site-header";

const fetchMock = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("SiteHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("shows login and start free when the user is logged out", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ authenticated: false, plan: null, redirectTo: "/login" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    render(<SiteHeader />);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
    });

    expect(screen.getByRole("link", { name: /start free/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /profile/i })).not.toBeInTheDocument();
  });

  it("shows profile and hides start free when the user is signed in", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ authenticated: true, plan: "free", redirectTo: "/invoice" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    render(<SiteHeader />);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: /profile/i })).toBeInTheDocument();
    });

    expect(screen.queryByRole("link", { name: /login/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /start free/i })).not.toBeInTheDocument();
  });
});
