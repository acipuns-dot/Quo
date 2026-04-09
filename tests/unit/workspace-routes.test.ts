import { beforeEach, describe, expect, it, vi } from "vitest";
import { createDefaultDocument } from "../../lib/documents/defaults";

const { createSupabaseServerClient } = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("../../lib/supabase/server", () => ({
  createSupabaseServerClient,
}));

import { POST as postBusiness } from "../../app/api/workspace/businesses/route";
import {
  POST as postCustomer,
} from "../../app/api/workspace/businesses/[businessId]/customers/route";
import {
  PATCH as patchDocument,
} from "../../app/api/workspace/businesses/[businessId]/documents/route";

type MockSupabaseOptions = {
  user?: { id: string } | null;
  ownedBusinessIds?: string[];
};

function createMockSupabase(options: MockSupabaseOptions = {}) {
  const inserted: Record<string, unknown[]> = {
    businesses: [],
    customers: [],
    documents: [],
  };

  const user = options.user ?? { id: "user_1" };
  const ownedBusinessIds = new Set(options.ownedBusinessIds ?? ["biz_1"]);

  function createBusinessesSelectChain() {
    const filters = new Map<string, unknown>();

    const chain = {
      eq(field: string, value: unknown) {
        filters.set(field, value);
        return chain;
      },
      order() {
        const businessId = filters.get("id");
        const userId = filters.get("user_id");
        const isOwned =
          typeof businessId === "string" &&
          typeof userId === "string" &&
          userId === user?.id &&
          ownedBusinessIds.has(businessId);

        return Promise.resolve({
          data: isOwned
            ? [{ id: businessId, user_id: userId }]
            : [],
          error: null,
        });
      },
      maybeSingle() {
        const businessId = filters.get("id");
        const userId = filters.get("user_id");
        const isOwned =
          typeof businessId === "string" &&
          typeof userId === "string" &&
          userId === user?.id &&
          ownedBusinessIds.has(businessId);

        return Promise.resolve({
          data: isOwned ? { id: businessId, user_id: userId } : null,
          error: null,
        });
      },
      single() {
        const businessId = filters.get("id");
        const userId = filters.get("user_id");
        const isOwned =
          typeof businessId === "string" &&
          typeof userId === "string" &&
          userId === user?.id &&
          ownedBusinessIds.has(businessId);

        return Promise.resolve({
          data: isOwned ? { id: businessId, user_id: userId } : null,
          error: isOwned ? null : { message: "Not found" },
        });
      },
    };

    return chain;
  }

  const supabase = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
      }),
    },
    from(table: string) {
      if (table === "businesses") {
        return {
          select() {
            return createBusinessesSelectChain();
          },
          insert(payload: unknown) {
            inserted.businesses.push(payload);

            return {
              select() {
                return {
                  single() {
                    return Promise.resolve({
                      data: {
                        id: "biz_created",
                        ...(payload as Record<string, unknown>),
                      },
                      error: null,
                    });
                  },
                };
              },
            };
          },
        };
      }

      if (table === "customers") {
        return {
          insert(payload: unknown) {
            inserted.customers.push(payload);

            return {
              select() {
                return {
                  single() {
                    return Promise.resolve({
                      data: {
                        id: "cust_created",
                        ...(payload as Record<string, unknown>),
                      },
                      error: null,
                    });
                  },
                };
              },
            };
          },
        };
      }

      if (table === "documents") {
        return {
          upsert(payload: unknown) {
            inserted.documents.push(payload);

            return {
              select() {
                return {
                  single() {
                    return Promise.resolve({
                      data: {
                        id: "doc_saved",
                        ...(payload as Record<string, unknown>),
                      },
                      error: null,
                    });
                  },
                };
              },
            };
          },
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    },
  };

  return { supabase, inserted };
}

describe("workspace route handlers", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  it("creates a business for the signed-in user", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";

    const { supabase, inserted } = createMockSupabase();
    createSupabaseServerClient.mockResolvedValue(supabase);

    const response = await postBusiness(
      new Request("http://localhost/api/workspace/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Quo Studio",
          address: "10 Main Street",
          email: "owner@example.com",
          phone: "123",
          taxNumber: "TAX-22",
          defaultCurrency: "USD",
          defaultTaxLabel: "Tax",
          defaultTaxRate: 6,
          defaultPaymentTerms: "Net 30",
          logoUrl: null,
          notes: "Main business",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(inserted.businesses).toEqual([
      expect.objectContaining({
        user_id: "user_1",
        name: "Quo Studio",
      }),
    ]);
  });

  it("creates a customer only when the business belongs to the signed-in user", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";

    const { supabase, inserted } = createMockSupabase({
      ownedBusinessIds: ["biz_1"],
    });
    createSupabaseServerClient.mockResolvedValue(supabase);

    const response = await postCustomer(
      new Request("http://localhost/api/workspace/businesses/biz_1/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Acme Trading",
          address: "88 River Road",
          email: "hello@acme.test",
          phone: "555-0101",
          taxNumber: "CUST-1",
          notes: "Priority customer",
        }),
      }),
      { params: Promise.resolve({ businessId: "biz_1" }) },
    );

    expect(response.status).toBe(200);
    expect(inserted.customers).toEqual([
      expect.objectContaining({
        business_id: "biz_1",
        name: "Acme Trading",
      }),
    ]);
  });

  it("rejects customer creation for a business the user does not own", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";

    const { supabase, inserted } = createMockSupabase({
      ownedBusinessIds: ["biz_1"],
    });
    createSupabaseServerClient.mockResolvedValue(supabase);

    const response = await postCustomer(
      new Request("http://localhost/api/workspace/businesses/biz_2/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Blue River",
          address: "",
          email: "",
          phone: "",
          taxNumber: "",
          notes: "",
        }),
      }),
      { params: Promise.resolve({ businessId: "biz_2" }) },
    );

    expect(response.status).toBe(404);
    expect(inserted.customers).toEqual([]);
  });

  it("updates a document only when the business belongs to the signed-in user", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";

    const { supabase, inserted } = createMockSupabase({
      ownedBusinessIds: ["biz_1"],
    });
    createSupabaseServerClient.mockResolvedValue(supabase);

    const response = await patchDocument(
      new Request("http://localhost/api/workspace/businesses/biz_1/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "invoice",
          customerId: null,
          status: "exported",
          data: createDefaultDocument("invoice"),
        }),
      }),
      { params: Promise.resolve({ businessId: "biz_1" }) },
    );

    expect(response.status).toBe(200);
    expect(inserted.documents).toEqual([
      expect.objectContaining({
        business_id: "biz_1",
        status: "exported",
      }),
    ]);
  });

  it("saves workspace documents with the business, kind, and document number identity fields", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";

    const { supabase, inserted } = createMockSupabase({
      ownedBusinessIds: ["biz_1"],
    });
    createSupabaseServerClient.mockResolvedValue(supabase);

    const payload = createDefaultDocument("invoice");
    payload.documentNumber = "INV-20260409";

    const response = await patchDocument(
      new Request("http://localhost/api/workspace/businesses/biz_1/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "invoice",
          customerId: null,
          status: "draft",
          data: payload,
        }),
      }),
      { params: Promise.resolve({ businessId: "biz_1" }) },
    );

    expect(response.status).toBe(200);
    expect(inserted.documents[0]).toEqual(
      expect.objectContaining({
        business_id: "biz_1",
        kind: "invoice",
        document_number: "INV-20260409",
      }),
    );
  });
});
