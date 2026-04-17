import { exportNodeToPdf } from "./export";
import type { DocumentData } from "./types";

export async function exportDocumentToPdf({
  data,
  previewNode,
  filename,
}: {
  data: DocumentData;
  previewNode: HTMLElement;
  filename: string;
}) {
  await exportNodeToPdf(previewNode, filename);
}
