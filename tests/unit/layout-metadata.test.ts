import { describe, expect, it } from "vitest";

describe("root layout metadata", () => {
  it("includes the Google AdSense account verification tag", async () => {
    const layoutModule = await import("../../app/layout");

    expect(layoutModule.metadata.other).toMatchObject({
      "google-adsense-account": "ca-pub-7939308887669985",
    });
  });
});
