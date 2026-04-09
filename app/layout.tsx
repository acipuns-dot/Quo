import "./globals.css";
import type { Metadata } from "next";
import React, { type ReactNode } from "react";

export const metadata: Metadata = {
  title: "QUO — Business Documents in Under 2 Minutes",
  description: "Create professional quotations, invoices, and receipts online. Live preview, instant PDF — free, no sign-up required.",
  other: {
    "google-adsense-account": "ca-pub-7939308887669985",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
