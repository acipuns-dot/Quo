import { describe, expect, it } from "vitest";
import {
  normalizeWorkspaceAccountProfile,
  resolvePostAuthPath,
} from "../../lib/workspace/account-profiles";

describe("workspace account profiles", () => {
  it("normalizes a Supabase row into app shape", () => {
    expect(
      normalizeWorkspaceAccountProfile({
        user_id: "user_1",
        plan: "free",
        created_at: "2026-04-08T00:00:00.000Z",
        updated_at: "2026-04-08T00:00:00.000Z",
      }),
    ).toEqual({
      userId: "user_1",
      plan: "free",
      createdAt: "2026-04-08T00:00:00.000Z",
      updatedAt: "2026-04-08T00:00:00.000Z",
    });
  });

  it("routes premium users into the workspace", () => {
    expect(resolvePostAuthPath("premium", "invoice")).toBe("/workspace/invoice");
  });

  it("routes free users into the free app", () => {
    expect(resolvePostAuthPath("free", "receipt")).toBe("/receipt");
  });
});
