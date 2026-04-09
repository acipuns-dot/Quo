import { describe, expect, it } from "vitest";
import { findMatchingCustomers } from "../../lib/workspace/customer-search";

const customers = [
  {
    id: "1",
    businessId: "biz_1",
    name: "Acme Trading",
    address: "",
    email: "",
    phone: "",
    taxNumber: "",
    notes: "",
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "2",
    businessId: "biz_1",
    name: "Acorn Logistics",
    address: "",
    email: "",
    phone: "",
    taxNumber: "",
    notes: "",
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "3",
    businessId: "biz_1",
    name: "Blue River",
    address: "",
    email: "",
    phone: "",
    taxNumber: "",
    notes: "",
    createdAt: "",
    updatedAt: "",
  },
];

describe("findMatchingCustomers", () => {
  it("returns prefix matches ahead of broader includes matches", () => {
    const results = findMatchingCustomers(customers, "ac");
    expect(results.map((customer) => customer.id)).toEqual(["1", "2"]);
  });

  it("returns an empty list for blank queries", () => {
    expect(findMatchingCustomers(customers, "   ")).toEqual([]);
  });
});
