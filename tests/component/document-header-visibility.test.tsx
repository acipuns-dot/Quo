import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { DocumentHeader } from "../../components/documents/document-header";
import { UnifiedTemplate } from "../../components/documents/templates/unified-template";
import { createDefaultDocument } from "../../lib/documents/defaults";

describe("header business name visibility", () => {
  const themeIds = ["gold", "blue", "emerald", "red", "teal", "violet"] as const;

  it("shows the business name in the shared header when there is no logo", () => {
    const data = createDefaultDocument("invoice");

    render(<DocumentHeader data={{ ...data, logoDataUrl: null }} />);

    expect(screen.getByText(data.businessName)).toBeInTheDocument();
  });

  it("hides the business name in the shared header when a logo exists", () => {
    const data = createDefaultDocument("invoice");

    render(
      <DocumentHeader
        data={{ ...data, logoDataUrl: "data:image/png;base64,abc" }}
      />,
    );

    expect(screen.queryByText(data.businessName)).not.toBeInTheDocument();
  });

  it("hides the business address in the shared header", () => {
    const data = createDefaultDocument("invoice");

    render(<DocumentHeader data={data} />);

    expect(screen.queryByText(data.businessAddress)).not.toBeInTheDocument();
  });

  it.each(themeIds)(
    "hides only the top header business name for %s theme when a logo exists",
    (themeId) => {
      const data = createDefaultDocument("invoice");

      render(
        <UnifiedTemplate
          data={{
            ...data,
            themeId,
            logoDataUrl: "data:image/png;base64,abc",
          }}
        />,
      );

      expect(screen.queryAllByText(data.businessName)).toHaveLength(1);
    },
  );

  it.each(themeIds)(
    "hides only the top header business address for %s theme",
    (themeId) => {
      const data = createDefaultDocument("invoice");

      render(<UnifiedTemplate data={{ ...data, themeId }} />);

      expect(screen.queryAllByText(data.businessAddress)).toHaveLength(1);
    },
  );
});
