import { describe, expect, it } from "vitest";
import {
  canAccessPremiumWorkspace,
  resolveWorkspaceAccess,
} from "../../lib/workspace/session";

describe("workspace session", () => {
  it("returns false without an authenticated user", () => {
    expect(canAccessPremiumWorkspace(null, null)).toBe(false);
  });

  it("returns false for a signed-in free user", () => {
    expect(canAccessPremiumWorkspace({ id: "user_1" }, "free")).toBe(false);
  });

  it("returns true for a signed-in premium user", () => {
    expect(canAccessPremiumWorkspace({ id: "user_1" }, "premium")).toBe(true);
  });

  it("redirects free users from workspace routes back into the free flow", () => {
    expect(resolveWorkspaceAccess({ id: "user_1" }, "free", "invoice")).toEqual({
      allowed: false,
      redirectTo: "/invoice?upsell=workspace",
    });
  });
});
