import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BusinessSwitcher } from "../../components/workspace/business-switcher";
import type { BusinessRecord } from "../../lib/workspace/types";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/invoice",
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams("tab=documents"),
}));

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

describe("BusinessSwitcher", () => {
  beforeEach(() => {
    push.mockReset();
  });

  it("updates the current route query when a different business is selected", () => {
    render(
      <BusinessSwitcher businesses={businesses} activeBusinessId="biz_1" />,
    );

    fireEvent.change(screen.getByLabelText("Active business"), {
      target: { value: "biz_2" },
    });

    expect(push).toHaveBeenCalledWith("/workspace/invoice?tab=documents&businessId=biz_2");
  });
});
