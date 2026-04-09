import { expect, test } from "@playwright/test";

test("quotation page supports template selection and live preview", async ({
  page,
}) => {
  await page.goto("/quotation");

  await expect(page.getByLabel("Business name")).toBeVisible();
  const templateCases = [
    {
      name: "Crisp",
      id: "minimal",
      selectedLabel: "Selected template: Crisp",
    },
    {
      name: "Horizon",
      id: "modern",
      selectedLabel: "Selected template: Horizon",
    },
    {
      name: "Prestige",
      id: "executive",
      selectedLabel: "Selected template: Prestige",
      previewText: "Prepared by",
    },
    {
      name: "Ledger",
      id: "classic",
      selectedLabel: "Selected template: Ledger",
      previewText: "From",
    },
    {
      name: "Vivid",
      id: "studio",
      selectedLabel: "Selected template: Vivid",
      previewText: "Prepared by",
    },
    {
      name: "Carbon",
      id: "statement",
      selectedLabel: "Selected template: Carbon",
      previewText: "Prepared by",
    },
  ] as const;

  const previewFrame = page.getByTestId("preview-frame");

  for (const templateCase of templateCases) {
    await page.getByRole("button", { name: `${templateCase.name} template` }).click();
    await expect(page.getByText(templateCase.selectedLabel)).toBeVisible();
    await expect(previewFrame).toHaveAttribute("data-template-id", templateCase.id);
    await expect(previewFrame.locator(`[data-renderer-id="${templateCase.id}"]`)).toBeVisible();
    if ("previewText" in templateCase) {
      await expect(previewFrame.getByText(templateCase.previewText)).toBeVisible();
    }
  }

  await page.getByLabel("Business name").fill("Northwind Studio");

  await expect(
    previewFrame.getByText("Northwind Studio", { exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Download PDF" })).toBeVisible();
});

test("receipt page supports receipt-specific fields", async ({ page }) => {
  await page.goto("/receipt");

  const previewFrame = page.getByTestId("preview-frame");
  await page.getByRole("button", { name: "Ledger template" }).click();
  await expect(page.getByText("Selected template: Ledger")).toBeVisible();
  await expect(previewFrame).toHaveAttribute("data-template-id", "classic");
  await expect(previewFrame.getByText("Received from")).toBeVisible();

  await page.getByRole("button", { name: /Document details/i }).click();
  await expect(page.getByLabel("Payment method")).toBeVisible();
  await page.getByLabel("Payment method").fill("Bank transfer");
  await page.getByLabel("Amount received").fill("325.50");

  await expect(page.getByText("Bank transfer")).toBeVisible();
  await expect(page.getByText("$325.50")).toBeVisible();
});

test("quotation preview paginates when line items overflow", async ({ page }) => {
  await page.goto("/quotation");
  await page.getByRole("button", { name: /Line items/i }).click();

  for (let index = 0; index < 11; index += 1) {
    await page.getByRole("button", { name: "Add line item" }).click();
  }

  for (let index = 0; index < 12; index += 1) {
    await page.getByLabel(`Line item ${index + 1} description`).fill(`Line item ${index + 1}`);
    await page.getByLabel(`Line item ${index + 1} note`).fill("Overflow note");
  }

  await page.getByRole("button", { name: /Notes/i }).click();
  await page.getByRole("textbox", { name: "Notes" }).fill("Payment due in 14 days.");

  await expect(page.getByText("Page 2 of 2")).toBeVisible();
  await expect(page.locator("[data-page-kind='continuation']")).toHaveCount(1);
});
