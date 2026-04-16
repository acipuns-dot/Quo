import type { BusinessRecord, CustomerRecord, SavedDocumentRecord } from "./types";

export type WorkspaceSidebarAction =
  | { id: string; kind: "business"; business: BusinessRecord }
  | { id: string; kind: "customer"; customer: CustomerRecord }
  | { id: string; kind: "document"; document: SavedDocumentRecord };

export type WorkspaceDocumentAction =
  | {
      id: string;
      kind: "customer";
      customer: Pick<CustomerRecord, "id" | "name" | "address">;
    }
  | {
      id: string;
      kind: "document";
      document: SavedDocumentRecord;
    };
