import { beforeEach, describe, expect, it, vi } from "vitest";
import { createDefaultDocument } from "../../lib/documents/defaults";
import {
  saveWorkspaceDraft,
  saveWorkspaceExport,
} from "../../lib/workspace/api-client";

describe("workspace api client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("posts draft payloads to the workspace documents endpoint", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );

    await saveWorkspaceDraft("/api/workspace/businesses/biz_1/documents", {
      kind: "invoice",
      customerId: null,
      data: createDefaultDocument("invoice"),
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/workspace/businesses/biz_1/documents",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("posts exported payloads with exported status", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );

    await saveWorkspaceExport("/api/workspace/businesses/biz_1/documents", {
      kind: "invoice",
      customerId: "cust_1",
      data: createDefaultDocument("invoice"),
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/workspace/businesses/biz_1/documents",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("\"status\":\"exported\""),
      }),
    );
  });
});
