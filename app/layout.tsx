import "./globals.css";
import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import React, { type ReactNode } from "react";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700", "800"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  weight: "400",
});

export const metadata: Metadata = {
  title: "QUO — Business Documents in Under 2 Minutes",
  description: "Create professional quotations, invoices, and receipts online. Live preview, instant PDF — free, no sign-up required.",
  other: {
    "google-adsense-account": "ca-pub-7939308887669985",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${instrumentSerif.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
