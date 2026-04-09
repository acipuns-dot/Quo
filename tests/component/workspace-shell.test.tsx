import "@testing-library/jest-dom/vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WorkspaceShell } from "../../components/workspace/workspace-shell";

vi.mock("../../components/workspace/business-switcher", () => ({
  BusinessSwitcher: () => <div data-testid="business-switcher">Business switcher</div>,
}));

vi.mock("../../components/workspace/business-panel", () => ({
  BusinessPanel: () => <div data-testid="business-panel">Business panel</div>,
}));

vi.mock("../../components/workspace/customer-panel", () => ({
  CustomerPanel: () => <div data-testid="customer-panel">Customer panel</div>,
}));

vi.mock("../../components/workspace/document-history-panel", () => ({
  DocumentHistoryPanel: () => <div data-testid="document-history-panel">Document history</div>,
}));

vi.mock("../../components/workspace/workspace-sidebar", () => ({
  WorkspaceSidebar: () => <div data-testid="workspace-sidebar">Sidebar</div>,
}));

describe("WorkspaceShell", () => {
  it("shows a profile link in the premium workspace header", () => {
    render(
      <WorkspaceShell
        activeBusiness={{
          id: "biz_1",
          userId: "user_1",
          name: "Acme",
          address: "",
          email: "",
          phone: "",
          taxNumber: "",
          defaultCurrency: "USD",
          defaultTaxLabel: "Tax",
          defaultTaxRate: 0,
          defaultPaymentTerms: "",
          logoUrl: null,
          notes: "",
          createdAt: "",
          updatedAt: "",
        }}
        businesses={[]}
        customers={[]}
        documents={[]}
      >
        <div>Workspace body</div>
      </WorkspaceShell>,
    );

    expect(screen.getByRole("link", { name: /profile/i })).toHaveAttribute("href", "/profile");
  });
});
