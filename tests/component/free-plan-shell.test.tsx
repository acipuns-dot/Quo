import "@testing-library/jest-dom/vitest";
import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { FreePlanShell } from "../../components/premium/free-plan-shell";

vi.mock("../../components/generator/document-generator", () => ({
  DocumentGenerator: ({ kind }: { kind: string }) => <div>Generator: {kind}</div>,
}));

vi.mock("../../components/site/site-header", () => ({
  SiteHeader: () => <div>Header</div>,
}));

describe("FreePlanShell", () => {
  const originalPublisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID = "ca-pub-7939308887669985";
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID = originalPublisherId;
  });

  it("shows the premium banner and AdSense script for signed-in free users", async () => {
    const user = userEvent.setup();

    render(
      <FreePlanShell
        kind="invoice"
        initialUpsellFeature={null}
        account={{ authenticated: true, plan: "free" }}
      />,
    );

    expect(screen.getByText(/free plan/i)).toBeInTheDocument();
    expect(screen.getByTestId("adsense-auto-ads")).toHaveAttribute(
      "data-script-src",
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
    );
    expect(screen.getByTestId("adsense-auto-ads")).toHaveAttribute(
      "data-publisher-id",
      "ca-pub-7939308887669985",
    );

    await user.click(screen.getByRole("button", { name: /upgrade now/i }));

    const dialog = screen.getByRole("dialog", { name: /unlock quo premium/i });

    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: /upgrade to premium/i })).toHaveAttribute("href", "/upgrade");
  });

  it("shows the premium banner and AdSense script for logged-out users", async () => {
    const user = userEvent.setup();

    render(
      <FreePlanShell
        kind="quotation"
        initialUpsellFeature={null}
        account={{ authenticated: false, plan: null }}
      />,
    );

    expect(screen.getByText(/free plan/i)).toBeInTheDocument();
    expect(screen.getByTestId("adsense-auto-ads")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /upgrade now/i }));

    const dialog = screen.getByRole("dialog", { name: /unlock quo premium/i });

    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: /upgrade to premium/i })).toHaveAttribute(
      "href",
      "/upgrade",
    );
  });

  it("hides the AdSense script for signed-in premium users", () => {
    render(
      <FreePlanShell
        kind="receipt"
        initialUpsellFeature={null}
        account={{ authenticated: true, plan: "premium" }}
      />,
    );

    expect(screen.queryByText(/free plan/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId("adsense-auto-ads")).not.toBeInTheDocument();
  });

  it("hides the AdSense script when the publisher id is missing", () => {
    delete process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;

    render(
      <FreePlanShell
        kind="invoice"
        initialUpsellFeature={null}
        account={{ authenticated: false, plan: null }}
      />,
    );

    expect(screen.queryByTestId("adsense-auto-ads")).not.toBeInTheDocument();
  });
});
