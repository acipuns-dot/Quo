import type { SavedDocumentRecord } from "../../lib/workspace/types";

export function DocumentHistoryPanel({ documents }: { documents: SavedDocumentRecord[] }) {
  return (
    <section>
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/25">Document history</p>
      <div className="space-y-1">
        {documents.length === 0 ? (
          <p className="px-3 text-xs text-white/30">No saved documents yet.</p>
        ) : (
          documents.map((document) => (
            <div key={document.id} className="cursor-pointer rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2 transition-colors hover:border-[#d4901e]/25 hover:bg-[#d4901e]/[0.07]">
              <div className="text-sm font-medium text-[#faf9f7]">
                {document.documentNumber || "Untitled"}
              </div>
              <div className="text-xs text-white/40">
                {document.kind} · {document.status}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
