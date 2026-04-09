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
  it("opens the premium upsell modal with shared benefits and an upgrade link", async () => {
    const user = userEvent.setup();

    render(
      <FreePlanShell
        kind="invoice"
        initialUpsellFeature={null}
        account={{ authenticated: true, plan: "free" }}
      />,
    );

    await user.click(screen.getByRole("button", { name: /saved customers/i }));

    const dialog = screen.getByRole("dialog", { name: /unlock quo premium/i });

    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/save repeat customer details once/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/multi-business workspace/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/document history/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/continue work across devices/i)).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: /upgrade to premium/i })).toHaveAttribute("href", "/upgrade");
  });
});
