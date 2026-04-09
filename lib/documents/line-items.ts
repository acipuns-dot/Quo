import type { LineItem } from "./types";

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
