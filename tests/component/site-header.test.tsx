import "@testing-library/jest-dom/vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SiteHeader } from "../../components/site/site-header";

const mockUsePathname = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

describe("SiteHeader", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/");
  });

  it("shows login and start free when the user is logged out", () => {
    render(<SiteHeader account={{ authenticated: false, plan: null }} />);

    expect(screen.getByRole("link", { name: /pricing/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /faq/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /start free/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /profile/i })).not.toBeInTheDocument();
  });

  it("shows profile and hides start free when the user is signed in", () => {
    render(<SiteHeader account={{ authenticated: true, plan: "free" }} />);

    expect(screen.getByRole("link", { name: /profile/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /login/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /start free/i })).not.toBeInTheDocument();
  });

  it("hides pricing and faq outside the landing page", () => {
    mockUsePathname.mockReturnValue("/upgrade");

    render(<SiteHeader account={{ authenticated: false, plan: null }} />);

    expect(screen.queryByRole("link", { name: /pricing/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /faq/i })).not.toBeInTheDocument();
  });
});
