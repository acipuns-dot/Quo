import "@testing-library/jest-dom/vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
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
  it("opens the premium upsell modal when a locked feature is clicked", async () => {
    const user = userEvent.setup();

    render(
      <FreePlanShell
        kind="invoice"
        initialUpsellFeature={null}
        account={{ authenticated: true, plan: "free" }}
      />,
    );

    await user.click(screen.getByRole("button", { name: /saved customers/i }));

    expect(screen.getByRole("dialog", { name: /unlock quo premium/i })).toBeInTheDocument();
    expect(screen.getByText(/reusable saved customers/i)).toBeInTheDocument();
  });
});
