import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WorkspaceSidebar } from "../../components/workspace/workspace-sidebar";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/invoice",
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams("businessId=biz_2&tab=documents"),
}));

describe("WorkspaceSidebar", () => {
  beforeEach(() => {
    push.mockReset();
  });

  it("pushes the selected workspace tab while preserving existing query params", () => {
    render(<WorkspaceSidebar />);

    fireEvent.click(screen.getByRole("button", { name: "Customers" }));

    expect(push).toHaveBeenCalledWith("/workspace/invoice?businessId=biz_2&tab=customers");
  });

  it("marks the current tab as active from the query string", () => {
    render(<WorkspaceSidebar />);

    expect(screen.getByRole("button", { name: "Documents" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Customers" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
