import React, { type ReactNode } from "react";

export function DocumentShell({
  children,
  accentClass,
  continuation = false,
}: {
  children: ReactNode;
  accentClass: string;
  continuation?: boolean;
}) {
  return (
    <article
      className={`document-sheet font-serif mx-auto flex h-[297mm] w-full max-w-[210mm] flex-col rounded-none overflow-hidden bg-white pt-[clamp(1.25rem,2.8vw,2.5rem)] px-[clamp(1.25rem,2.8vw,2.5rem)] pb-0 shadow-md ${accentClass} ${
        continuation ? "mt-6 print:break-before-page" : ""
      } ${continuation ? "html2pdf__page-break" : ""}`}
      data-page-kind={continuation ? "continuation" : "first"}
    >
      {children}
    </article>
  );
}
