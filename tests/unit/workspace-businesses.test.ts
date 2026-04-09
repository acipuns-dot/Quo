import { describe, expect, it } from "vitest";
import { resolveActiveBusiness } from "../../lib/workspace/businesses";
import type { BusinessRecord } from "../../lib/workspace/types";

const businesses: BusinessRecord[] = [
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
];

describe("resolveActiveBusiness", () => {
  it("returns the requested business when the id is present", () => {
    expect(resolveActiveBusiness(businesses, "biz_2")?.id).toBe("biz_2");
  });

  it("falls back to the first business when the requested id is missing", () => {
    expect(resolveActiveBusiness(businesses, "biz_missing")?.id).toBe("biz_1");
  });

  it("returns undefined when there are no businesses", () => {
    expect(resolveActiveBusiness([], "biz_1")).toBeUndefined();
  });
});
