import React from "react";
import type { DocumentKind } from "../../lib/documents/types";
import type { SavedDocumentRecord } from "../../lib/workspace/types";

export function DocumentHistoryTab({
  documents,
  kind,
}: {
  documents: SavedDocumentRecord[];
  kind: DocumentKind;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[#faf9f7]">Document History</h2>
        <p className="mt-1 text-sm text-white/40">All saved documents for this business.</p>
      </div>
      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.02] py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05]">
            <svg
              className="h-6 w-6 text-white/25"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-white/40">No documents yet</p>
          <p className="mt-1 text-xs text-white/25">Documents you save will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <a
              key={doc.id}
              href={`/workspace/${doc.kind}?tab=documents`}
              className="flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 transition-all hover:border-[#d4901e]/25 hover:bg-[#d4901e]/[0.06]"
            >
              <div>
                <div className="text-sm font-semibold text-[#faf9f7]">
                  {doc.documentNumber || "Untitled"}
                </div>
                <div className="mt-0.5 text-xs text-white/40">
                  {doc.kind} - {doc.issueDate}
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${
                  doc.status === "exported"
                    ? "border border-[#16a34a]/30 bg-[#16a34a]/10 text-[#4ade80]"
                    : "border border-white/10 bg-white/[0.05] text-white/40"
                }`}
              >
                {doc.status}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
