import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { createSupabaseServerClient } = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
}));
const { listBusinessesForUser } = vi.hoisted(() => ({
  listBusinessesForUser: vi.fn(),
}));
const { listCustomersForBusiness } = vi.hoisted(() => ({
  listCustomersForBusiness: vi.fn(),
}));
const { listDocumentsForBusiness } = vi.hoisted(() => ({
  listDocumentsForBusiness: vi.fn(),
}));
const { getWorkspaceAccountProfile } = vi.hoisted(() => ({
  getWorkspaceAccountProfile: vi.fn(),
}));
const redirect = vi.fn();
const notFound = vi.fn();

vi.mock("../../lib/supabase/server", () => ({
  createSupabaseServerClient,
}));

vi.mock("../../lib/workspace/businesses", async () => {
  const actual = await vi.importActual<typeof import("../../lib/workspace/businesses")>(
    "../../lib/workspace/businesses",
  );

  return {
    ...actual,
    listBusinessesForUser,
  };
});

vi.mock("../../lib/workspace/customers", () => ({
  listCustomersForBusiness,
}));

vi.mock("../../lib/workspace/documents", () => ({
  listDocumentsForBusiness,
}));

vi.mock("../../lib/workspace/account-profiles", () => ({
  getWorkspaceAccountProfile,
}));

vi.mock("next/navigation", () => ({
  redirect,
  notFound,
}));

vi.mock("../../components/workspace/workspace-shell", () => ({
  WorkspaceShell: ({
    activeBusiness,
    customers,
    documents,
    children,
  }: {
    activeBusiness: { id: string; name: string };
    customers: Array<{ id: string; name: string }>;
    documents: Array<{ id: string; documentNumber: string }>;
    children: React.ReactNode;
  }) => (
    <div>
      <div data-testid="active-business">{activeBusiness.name}</div>
      <div data-testid="customer-count">{customers.length}</div>
      <div data-testid="document-count">{documents.length}</div>
      {children}
    </div>
  ),
}));

vi.mock("../../components/workspace/business-defaults-banner", () => ({
  BusinessDefaultsBanner: ({ business }: { business: { name: string } }) => (
    <div data-testid="business-banner">{business.name}</div>
  ),
}));

vi.mock("../../components/generator/document-generator", () => ({
  DocumentGenerator: ({
    workspace,
  }: {
    workspace?: {
      businessId: string;
      businessName: string;
      customerOptions?: Array<{ id: string; name: string }>;
    };
  }) => (
    <div>
      <div data-testid="generator-business-id">{workspace?.businessId}</div>
      <div data-testid="generator-business-name">{workspace?.businessName}</div>
      <div data-testid="generator-customer-options">{workspace?.customerOptions?.length ?? 0}</div>
    </div>
  ),
}));

describe("workspace page", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  });

  it("loads the selected business scope from the query string", async () => {
    createSupabaseServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user_1" } },
        }),
      },
    });
    getWorkspaceAccountProfile.mockResolvedValue({
      userId: "user_1",
      plan: "premium",
      createdAt: "2026-04-08T00:00:00.000Z",
      updatedAt: "2026-04-08T00:00:00.000Z",
    });

    listBusinessesForUser.mockResolvedValue([
      {
        id: "biz_1",
        userId: "user_1",
        name: "Northwind",
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
      },
      {
        id: "biz_2",
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
      },
    ]);

    listCustomersForBusiness.mockResolvedValue([
      {
        id: "cust_2",
        businessId: "biz_2",
        name: "Blue River",
        address: "55 Lake Road",
        email: "",
        phone: "",
        taxNumber: "",
        notes: "",
        createdAt: "",
        updatedAt: "",
      },
    ]);

    listDocumentsForBusiness.mockResolvedValue([
      {
        id: "doc_2",
        businessId: "biz_2",
        customerId: null,
        kind: "invoice",
        status: "draft",
        documentNumber: "INV-2",
        issueDate: "2026-04-08",
        payloadVersion: 1,
        payload: {} as never,
        createdAt: "",
        updatedAt: "",
      },
    ]);

    const pageModule = await import("../../app/(workspace)/workspace/[kind]/page");
    const view = await pageModule.default({
      params: Promise.resolve({ kind: "invoice" }),
      searchParams: Promise.resolve({ businessId: "biz_2" }),
    });

    render(view);

    expect(screen.getByTestId("active-business")).toHaveTextContent("Acme");
    expect(screen.getByTestId("business-banner")).toHaveTextContent("Acme");
    expect(screen.getByTestId("generator-business-id")).toHaveTextContent("biz_2");
    expect(screen.getByTestId("generator-business-name")).toHaveTextContent("Acme");
    expect(screen.getByTestId("generator-customer-options")).toHaveTextContent("1");
    expect(listCustomersForBusiness).toHaveBeenCalledWith(expect.anything(), "biz_2");
    expect(listDocumentsForBusiness).toHaveBeenCalledWith(expect.anything(), "biz_2");
  });

  it("redirects signed-in free users to the matching free route with a workspace upsell trigger", async () => {
    createSupabaseServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user_1" } },
        }),
      },
    });

    getWorkspaceAccountProfile.mockResolvedValue({
      userId: "user_1",
      plan: "free",
      createdAt: "2026-04-08T00:00:00.000Z",
      updatedAt: "2026-04-08T00:00:00.000Z",
    });

    const pageModule = await import("../../app/(workspace)/workspace/[kind]/page");

    await pageModule.default({
      params: Promise.resolve({ kind: "invoice" }),
      searchParams: Promise.resolve({}),
    });

    expect(redirect).toHaveBeenCalledWith("/invoice?upsell=workspace");
  });

  it("shows the premium empty state when a premium user has no businesses", async () => {
    createSupabaseServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user_1" } },
        }),
      },
    });

    getWorkspaceAccountProfile.mockResolvedValue({
      userId: "user_1",
      plan: "premium",
      createdAt: "2026-04-08T00:00:00.000Z",
      updatedAt: "2026-04-08T00:00:00.000Z",
    });

    listBusinessesForUser.mockResolvedValue([]);
    listCustomersForBusiness.mockResolvedValue([]);
    listDocumentsForBusiness.mockResolvedValue([]);

    const pageModule = await import("../../app/(workspace)/workspace/[kind]/page");
    const view = await pageModule.default({
      params: Promise.resolve({ kind: "invoice" }),
      searchParams: Promise.resolve({}),
    });

    const { container } = render(view);
    expect(container).toHaveTextContent("Create your first business to start using Quo Premium.");
  });
});
