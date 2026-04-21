# Mobile Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the entire Quodo webapp fully usable on mobile (375px+), including Form/Preview tabs, workspace bottom nav, swipe gestures, and PWA installation.

**Architecture:** Mobile-first using Tailwind `md:` prefixes — mobile is the default layout, desktop is the progressive enhancement. No parallel component trees; all changes are in existing files plus two new components (`MobileBottomNav`, `useMobilePreviewScale` hook).

**Tech Stack:** Next.js 15 App Router, React 19, Tailwind CSS, TypeScript. No new dependencies.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `components/workspace/mobile-bottom-nav.tsx` | Bottom nav bar for workspace on mobile |
| Create | `hooks/use-mobile-preview-scale.ts` | Hook: calculates A4 scale factor for viewport |
| Modify | `components/generator/document-generator.tsx` | Tab state, swipe handler, mobile layout |
| Modify | `components/generator/preview-panel.tsx` | Apply scale transform on mobile |
| Modify | `components/generator/action-bar.tsx` | Pin to bottom on mobile |
| Modify | `app/(workspace)/workspace/[kind]/page.tsx` | Integrate bottom nav, hide sidebar on mobile |
| Modify | `components/generator/document-form.tsx` | Touch target + padding fixes |
| Modify | `components/site/site-header.tsx` | Mobile nav visibility fix |
| Modify | `app/layout.tsx` | PWA meta tags + service worker registration |
| Create | `public/manifest.json` | PWA manifest (Quodo branding) |
| Create | `public/sw.js` | Service worker (cache-first static, network-first API) |

---

## Task 1: `use-mobile-preview-scale` hook

**Files:**
- Create: `hooks/use-mobile-preview-scale.ts`

- [ ] **Step 1: Create the hook**

```ts
// hooks/use-mobile-preview-scale.ts
"use client";

import { useEffect, useState } from "react";

const A4_PX_WIDTH = 794;

export function useMobilePreviewScale(horizontalPadding = 32): number | null {
  const [scale, setScale] = useState<number | null>(null);

  useEffect(() => {
    function calculate() {
      if (window.innerWidth >= 768) {
        setScale(null);
        return;
      }
      setScale((window.innerWidth - horizontalPadding) / A4_PX_WIDTH);
    }
    calculate();
    window.addEventListener("resize", calculate);
    return () => window.removeEventListener("resize", calculate);
  }, [horizontalPadding]);

  return scale;
}
```

- [ ] **Step 2: Commit**

```bash
git add hooks/use-mobile-preview-scale.ts
git commit -m "feat: add useMobilePreviewScale hook"
```

---

## Task 2: `PreviewPanel` — mobile scale transform

**Files:**
- Modify: `components/generator/preview-panel.tsx`

- [ ] **Step 1: Apply scale transform when hook returns a value**

Replace the full contents of `components/generator/preview-panel.tsx` with:

```tsx
import React from "react";
import { paginateDocument } from "../../lib/documents/pagination";
import type { DocumentData } from "../../lib/documents/types";
import { getTemplatesForKind } from "../../lib/documents/templates";
import { useMobilePreviewScale } from "../../hooks/use-mobile-preview-scale";

export function PreviewPanel({ data }: { data: DocumentData }) {
  const templates = getTemplatesForKind(data.kind);
  const template =
    templates.find((candidate) => candidate.id === data.templateId) ??
    templates[0];
  const scale = useMobilePreviewScale();

  if (!template) return null;

  const renderedPages = React.Children.toArray(template.render(data));
  const isMultipage = paginateDocument(data).pages.length > 1;

  return (
    <div
      data-testid="preview-stack"
      data-renderer-id={template.id}
      data-preview-mode={isMultipage ? "multipage" : "single-page"}
      className={`flex flex-col items-center ${isMultipage ? "gap-8" : "gap-4"}`}
      style={
        scale !== null
          ? { transform: `scale(${scale})`, transformOrigin: "top center" }
          : undefined
      }
    >
      {renderedPages}
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/generator/preview-panel.tsx
git commit -m "feat: scale A4 preview to fit mobile viewport"
```

---

## Task 3: `ActionBar` — pin to bottom on mobile

**Files:**
- Modify: `components/generator/action-bar.tsx`

- [ ] **Step 1: Add mobile pinned bar**

Replace the full contents of `components/generator/action-bar.tsx` with:

```tsx
"use client";

import React from "react";

type ActionBarProps = {
  onPrint: () => void;
  onDownloadPdf: () => void;
  workspaceMode?: boolean;
  onSave?: () => void;
  saveState?: "idle" | "saving" | "saved" | "error";
  onClearDraft?: () => void;
};

export function ActionBar({
  onPrint,
  onDownloadPdf,
  workspaceMode,
  onSave,
  saveState,
  onClearDraft,
}: ActionBarProps) {
  return (
    <>
      {/* Mobile pinned bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 flex items-center gap-2 border-t border-white/[0.07] bg-[#111111] px-4 py-3 no-print">
        {onClearDraft && (
          <button
            type="button"
            onClick={onClearDraft}
            className="flex-1 rounded-lg border border-white/10 bg-white/[0.06] py-2.5 text-sm font-semibold text-white/60 min-h-[44px]"
          >
            Clear
          </button>
        )}
        {workspaceMode && onSave && (
          <button
            type="button"
            onClick={onSave}
            disabled={saveState === "saving"}
            className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] py-2.5 text-sm font-semibold text-white min-h-[44px] disabled:opacity-60"
          >
            {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : saveState === "error" ? "Error" : "Save"}
          </button>
        )}
        <button
          type="button"
          onClick={onDownloadPdf}
          className="flex-1 rounded-lg bg-[#d4901e] py-2.5 text-sm font-semibold text-[#111111] min-h-[44px]"
        >
          Download PDF
        </button>
      </div>

      {/* Desktop inline bar (unchanged) */}
      <div className="hidden md:flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onPrint}
          className="rounded-full bg-stone-900 px-5 py-2 text-sm font-medium text-white hover:bg-stone-700 active:bg-stone-800"
        >
          Print
        </button>
        <button
          type="button"
          onClick={onDownloadPdf}
          className="rounded-full border border-stone-300 bg-white px-5 py-2 text-sm font-medium text-stone-700 hover:border-stone-400 hover:bg-stone-50 active:bg-stone-100"
        >
          Download PDF
        </button>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/generator/action-bar.tsx
git commit -m "feat: pin action bar to bottom on mobile"
```

---

## Task 4: `MobileBottomNav` component

**Files:**
- Create: `components/workspace/mobile-bottom-nav.tsx`

The workspace sidebar has sections: Businesses, Customers, History, Items. The active section is tracked by a string key in the workspace page.

- [ ] **Step 1: Create the component**

```tsx
// components/workspace/mobile-bottom-nav.tsx
"use client";

import React from "react";

export type BottomNavSection = "businesses" | "customers" | "history" | "items";

type MobileBottomNavProps = {
  active: BottomNavSection;
  onChange: (section: BottomNavSection) => void;
};

const NAV_ITEMS: { id: BottomNavSection; label: string; icon: React.ReactNode }[] = [
  {
    id: "businesses",
    label: "Businesses",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15l.75 7.5H3.75L4.5 3zM9 21V10.5m6 0V21" />
      </svg>
    ),
  },
  {
    id: "customers",
    label: "Customers",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    id: "history",
    label: "History",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>
    ),
  },
  {
    id: "items",
    label: "Items",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0z" />
      </svg>
    ),
  },
];

export function MobileBottomNav({ active, onChange }: MobileBottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 flex items-stretch border-t border-white/[0.07] bg-[#111111] no-print">
      {NAV_ITEMS.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 min-h-[56px] transition-colors ${
              isActive ? "text-[#d4901e]" : "text-white/40"
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-semibold">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/workspace/mobile-bottom-nav.tsx
git commit -m "feat: add MobileBottomNav component for workspace"
```

---

## Task 5: `document-generator.tsx` — Form/Preview tabs + swipe

This is the largest task. The generator currently renders a fixed desktop layout. We add:
1. `activeTab: "form" | "preview"` state
2. Touch swipe handler
3. Conditional mobile layout using Tailwind `md:` prefixes
4. Bottom padding so content clears the pinned action bar on mobile

**Files:**
- Modify: `components/generator/document-generator.tsx`

- [ ] **Step 1: Add tab state and swipe handler near the top of the render function**

Find the `// ─── render` comment (around line 1192) and add state + handler just before the `return`:

```tsx
// Mobile tab state
const [activeTab, setActiveTab] = React.useState<"form" | "preview">("form");

// Swipe handler
const touchStartX = React.useRef<number | null>(null);
function handleTouchStart(e: React.TouchEvent) {
  touchStartX.current = e.touches[0].clientX;
}
function handleTouchEnd(e: React.TouchEvent) {
  if (touchStartX.current === null) return;
  const delta = e.changedTouches[0].clientX - touchStartX.current;
  touchStartX.current = null;
  if (delta < -50) setActiveTab("preview");
  if (delta > 50) setActiveTab("form");
}
```

- [ ] **Step 2: Wrap the main layout div with swipe handlers and add mobile tab bar**

Find the line:
```tsx
<div className="grid grid-cols-[400px_1fr] flex-1 min-h-0 overflow-hidden">
```

Replace it with:
```tsx
{/* Mobile tab bar */}
<div className="md:hidden flex border-b border-white/[0.07] bg-[#111111] flex-shrink-0 no-print">
  <button
    type="button"
    onClick={() => setActiveTab("form")}
    className={`flex-1 py-3 text-sm font-semibold transition-colors min-h-[44px] ${
      activeTab === "form" ? "text-[#faf9f7] border-b-2 border-[#d4901e]" : "text-white/40"
    }`}
  >
    Form
  </button>
  <button
    type="button"
    onClick={() => setActiveTab("preview")}
    className={`flex-1 py-3 text-sm font-semibold transition-colors min-h-[44px] ${
      activeTab === "preview" ? "text-[#faf9f7] border-b-2 border-[#d4901e]" : "text-white/40"
    }`}
  >
    Preview
  </button>
</div>

<div
  className="md:grid md:grid-cols-[400px_1fr] flex-1 min-h-0 overflow-hidden"
  onTouchStart={handleTouchStart}
  onTouchEnd={handleTouchEnd}
>
```

- [ ] **Step 3: Hide form panel on mobile when preview tab is active**

Find:
```tsx
<div className="bg-[#111111] border-r border-white/[0.07] overflow-y-auto flex flex-col no-print">
```

Replace with:
```tsx
<div className={`bg-[#111111] border-r border-white/[0.07] overflow-y-auto flex flex-col no-print pb-[60px] md:pb-0 ${activeTab === "preview" ? "hidden md:flex" : "flex"}`}>
```

- [ ] **Step 4: Hide preview panel on mobile when form tab is active**

Find:
```tsx
<div className="grid grid-cols-[1fr_180px] min-h-0 overflow-hidden">
```

Replace with:
```tsx
<div className={`md:grid md:grid-cols-[1fr_180px] min-h-0 overflow-hidden ${activeTab === "form" ? "hidden md:grid" : "flex flex-col"}`}>
```

- [ ] **Step 5: Make template/colour panel inline on mobile**

Find:
```tsx
<div className="border-l border-white/[0.07] bg-[#111111] flex flex-col gap-5 py-5 px-4 overflow-y-auto no-print w-[180px] shrink-0">
```

Replace with:
```tsx
<div className="md:border-l border-t border-white/[0.07] bg-[#111111] flex flex-col gap-5 py-5 px-4 overflow-y-auto no-print md:w-[180px] md:shrink-0 pb-[60px] md:pb-5">
```

- [ ] **Step 6: Verify build**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add components/generator/document-generator.tsx
git commit -m "feat: add mobile Form/Preview tabs and swipe gesture to generator"
```

---

## Task 6: Workspace page — bottom nav + hide sidebar on mobile

**Files:**
- Modify: `app/(workspace)/workspace/[kind]/page.tsx`

The workspace page has a left sidebar with section navigation. We hide it on mobile and wire up `MobileBottomNav` to the same active section state.

- [ ] **Step 0: Read the file to find the active section state variable name**

```bash
grep -n "useState\|activeTab\|activeSection\|setActive" "app/(workspace)/workspace/[kind]/page.tsx" | head -20
```

Note the exact variable name used for the active sidebar section before proceeding.

- [ ] **Step 1: Import MobileBottomNav**

At the top of `app/(workspace)/workspace/[kind]/page.tsx`, add:

```tsx
import { MobileBottomNav, type BottomNavSection } from "../../../../components/workspace/mobile-bottom-nav";
```

- [ ] **Step 2: Find the existing active section state**

Look for the state variable that tracks which sidebar tab is active (e.g. `activeTab`, `activeSection`, or similar). Note its name — it controls which panel is shown (Businesses, Customers, History, Items).

If it uses a different string type than `BottomNavSection`, add a mapping:

```tsx
function toBottomNavSection(active: string): BottomNavSection {
  if (active === "businesses" || active === "customers" || active === "history" || active === "items") {
    return active;
  }
  return "businesses";
}
```

- [ ] **Step 3: Add `md:hidden` to the left sidebar wrapper**

Find the left sidebar container div (the one that wraps the section navigation links). Add `md:block hidden` or `hidden md:flex` to it so it only shows on desktop. The exact class depends on its current display type — find the outer wrapper of the sidebar and prepend `hidden md:flex` (or `hidden md:block`) to its className.

- [ ] **Step 4: Add MobileBottomNav before the closing tag of the workspace shell**

At the very end of the workspace page JSX (before the final closing `</div>` or `</>`), add:

```tsx
<MobileBottomNav
  active={toBottomNavSection(activeSection)}
  onChange={(section) => setActiveSection(section)}
/>
```

Where `activeSection` and `setActiveSection` are the existing state variable and setter. Use the actual names from the file.

- [ ] **Step 5: Add bottom padding to the main content area to clear the bottom nav**

The main content area (right of the sidebar) needs `pb-[56px] md:pb-0` so content isn't hidden behind the fixed bottom nav on mobile.

Find the main content wrapper div and add those classes.

- [ ] **Step 6: Verify build**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add app/(workspace)/workspace/[kind]/page.tsx
git commit -m "feat: add workspace bottom nav and hide sidebar on mobile"
```

---

## Task 7: Touch target and padding fixes

**Files:**
- Modify: `components/generator/document-form.tsx`
- Modify: `components/site/site-header.tsx`

- [ ] **Step 1: Fix form horizontal padding on mobile**

In `components/generator/document-form.tsx`, find the outermost wrapper div. Ensure it uses `px-4 md:px-5` instead of a fixed `px-5`. Search for hardcoded `px-5` or `px-7` on section wrappers and prefix with responsive classes:

Replace occurrences of `px-5` on form section wrappers with `px-4 md:px-5`.
Replace occurrences of `px-7` with `px-4 md:px-7`.

- [ ] **Step 2: Fix line item row touch targets**

In `components/generator/document-form.tsx`, find the line item row buttons/divs. Ensure each interactive row has at least `py-3` (it likely already does — verify and add if missing).

- [ ] **Step 3: Fix site header mobile nav**

In `components/site/site-header.tsx`, the `<nav>` already has `hidden md:flex`. Verify the Login and "Start free" CTA buttons are always visible (not inside the hidden nav). They are already in a separate `<div className="flex items-center gap-2">` — confirm this div has no `hidden` class. If CTA buttons are too small on mobile, add `min-h-[44px]` to them:

```tsx
className="quo-header-cta rounded-lg px-4 py-2 text-sm font-bold transition-all duration-150 hover:brightness-110 active:scale-95 min-h-[44px] flex items-center"
```

- [ ] **Step 4: Verify build**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4b: Fix touch targets in workspace modals**

In each of the following files, find close/submit buttons and add `min-h-[44px]` where missing:
- `components/workspace/business-form-modal.tsx`
- `components/workspace/customer-form-modal.tsx`
- `components/workspace/confirm-workspace-action-modal.tsx`

Search for `<button` tags and ensure any icon-only buttons have both `min-h-[44px]` and `min-w-[44px]`.

- [ ] **Step 5: Verify build**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add components/generator/document-form.tsx components/site/site-header.tsx components/workspace/business-form-modal.tsx components/workspace/customer-form-modal.tsx components/workspace/confirm-workspace-action-modal.tsx
git commit -m "fix: mobile touch targets and padding in form, header and modals"
```

---

## Task 8: PWA — manifest and service worker

**Files:**
- Create: `public/manifest.json`
- Create: `public/sw.js`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create PWA manifest**

Create `public/manifest.json`:

```json
{
  "name": "Quodo",
  "short_name": "Quodo",
  "description": "Free invoice, quotation & receipt generator",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#111111",
  "theme_color": "#d4901e",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

- [ ] **Step 2: Create service worker**

Create `public/sw.js`:

```js
const CACHE_NAME = "quodo-v1";
const STATIC_EXTENSIONS = [".js", ".css", ".woff2", ".woff", ".ttf", ".png", ".ico", ".svg"];

function isStaticAsset(url) {
  return STATIC_EXTENSIONS.some((ext) => url.pathname.endsWith(ext));
}

function isApiRoute(url) {
  return url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/");
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== "GET") return;

  if (isApiRoute(url)) {
    // Network-first for API routes
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  if (isStaticAsset(url)) {
    // Cache-first for static assets
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ??
          fetch(event.request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            return response;
          })
      )
    );
    return;
  }

  // Network-first for navigation
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
```

- [ ] **Step 3: Generate PWA icons**

Create the `public/icons/` directory and generate two PNG icons from the existing `app/favicon.ico`:

```bash
mkdir -p public/icons
```

Use any image tool to create `public/icons/icon-192.png` (192×192) and `public/icons/icon-512.png` (512×512) from the favicon. If using ImageMagick:

```bash
convert app/favicon.ico -resize 192x192 public/icons/icon-192.png
convert app/favicon.ico -resize 512x512 public/icons/icon-512.png
```

If ImageMagick is not available, create simple placeholder PNGs using Node:

```bash
node -e "
const { createCanvas } = require('canvas');
// If canvas not available, manually place 192x192 and 512x512 PNG files
// with the Quodo logo in public/icons/
console.log('Place icon-192.png and icon-512.png in public/icons/');
"
```

> **Note:** If neither tool is available, create the icons manually using any image editor and place them at `public/icons/icon-192.png` and `public/icons/icon-512.png`. The icons should be square PNGs with the Quodo amber (`#d4901e`) brand color on a dark (`#111111`) background with the "Q" or "QUODO" wordmark.

- [ ] **Step 4: Add PWA meta tags and service worker registration to layout**

Replace the contents of `app/layout.tsx` with:

```tsx
import "./globals.css";
import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import React, { type ReactNode } from "react";
import Script from "next/script";

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
  title: "Quodo — Free Invoice, Quotation & Receipt Generator",
  description:
    "Create professional invoices, quotations, and receipts online for free. No sign-up, no watermark, instant PDF download.",
  metadataBase: new URL("https://quodo.app"),
  alternates: {
    canonical: "/",
  },
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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#d4901e" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Quodo" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        {children}
        <Script
          id="sw-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Verify build**

```bash
npx tsc --noEmit && npm run build
```

Expected: build completes without errors.

- [ ] **Step 6: Commit**

```bash
git add public/manifest.json public/sw.js public/icons/ app/layout.tsx
git commit -m "feat: add PWA manifest, service worker and meta tags"
```

---

## Task 9: Acceptance testing

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Open Chrome DevTools → Toggle device toolbar → iPhone SE (375px)**

Verify each item:
- [ ] No horizontal scroll on `/invoice`, `/quotation`, `/receipt`
- [ ] Form tab and Preview tab visible and switching correctly
- [ ] Swiping left switches to Preview, swiping right switches to Form
- [ ] Action bar pinned at bottom on both tabs
- [ ] A4 preview scales to fit the 375px viewport without clipping or horizontal scroll
- [ ] PDF export completes — tap Download PDF, verify file downloads
- [ ] No horizontal scroll on landing page `/`
- [ ] Header Login / Start free buttons visible and tappable

- [ ] **Step 3: Test workspace at 375px (requires premium account)**

- [ ] Bottom nav visible with 4 items: Businesses, Customers, History, Items
- [ ] Tapping each nav item switches the active section
- [ ] Left sidebar hidden on mobile
- [ ] Content does not overlap the bottom nav
- [ ] Generator Form/Preview tabs work inside workspace

- [ ] **Step 4: Test PWA installability**

In Chrome on a mobile device or DevTools → Application → Manifest:
- [ ] Manifest loads without errors
- [ ] Icons display correctly
- [ ] "Add to Home Screen" prompt appears or can be triggered
- [ ] App launches in standalone mode from home screen

- [ ] **Step 5: Final build check**

```bash
npm run build
```

Expected: successful build, no errors.

- [ ] **Step 6: Commit and push**

```bash
git add -A
git commit -m "feat: mobile support — tabs, bottom nav, swipe, PWA"
git push
```
