import "@testing-library/jest-dom/vitest";
import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FreePlanShell } from "../../components/premium/free-plan-shell";

vi.mock("../../components/generator/document-generator", () => ({
  DocumentGenerator: ({ kind }: { kind: string }) => <div>Generator: {kind}</div>,
}));

vi.mock("../../components/site/site-header", () => ({
  SiteHeader: () => <div>Header</div>,
}));

describe("FreePlanShell", () => {
  it("shows a compact premium notice for free users and opens the upsell modal from the single CTA", async () => {
    const user = userEvent.setup();

    render(
      <FreePlanShell
        kind="invoice"
        initialUpsellFeature={null}
        account={{ authenticated: true, plan: "free" }}
      />,
    );

    expect(screen.getByText(/free plan/i)).toBeInTheDocument();
    expect(
      screen.getByText(/save repeat customer details, reopen document history, and manage multiple businesses/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /upgrade now/i }));

    const dialog = screen.getByRole("dialog", { name: /unlock quo premium/i });

    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: /upgrade to premium/i })).toHaveAttribute("href", "/upgrade");
  });
});
