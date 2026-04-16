import type { LineItem } from "./types";

export const BUILT_IN_LINE_ITEM_UNITS = [
  "",
  "pcs",
  "unit",
  "set",
  "pack",
  "box",
  "kg",
  "g",
  "ton",
  "lb",
  "oz",
  "mm",
  "cm",
  "m",
  "km",
  "inch",
  "ft",
  "yd",
  "m2",
  "ft2",
  "ml",
  "L",
  "m3",
  "hour",
  "day",
  "week",
  "month",
  "custom",
] as const;

export function isRenderableLineItem(item: LineItem) {
  return (
    item.description.trim() !== "" ||
    item.note.trim() !== "" ||
    item.unitPrice !== 0
  );
}

export function getRenderableLineItems(items: LineItem[]) {
  return items.filter(isRenderableLineItem);
}

export function getLineItemUnitLabel(item: Pick<LineItem, "unit" | "customUnit">) {
  if (item.unit === "custom") {
    return item.customUnit?.trim() ?? "";
  }

  return item.unit?.trim() ?? "";
}

export function formatLineItemQuantity(
  item: Pick<LineItem, "quantity" | "unit" | "customUnit">,
) {
  const label = getLineItemUnitLabel(item);
  return label ? `${item.quantity} ${label}` : String(item.quantity);
}
