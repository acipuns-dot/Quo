# Mobile Support — Design Spec
**Date:** 2026-04-21
**Scope:** Full webapp (free pages + premium workspace)
**Approach:** Mobile-first rewrite using Tailwind responsive prefixes

---

## 1. Goals

- Make the entire Quodo webapp fully usable on mobile phones (minimum 375px viewport)
- No horizontal scroll at any breakpoint
- All interactive elements meet 44px minimum touch target
- PDF export continues to work in-browser on mobile
- App is installable as a PWA branded as Quodo

---

## 2. Breakpoint Strategy

- **Mobile:** below `md` (< 768px) — tab-based generator, bottom nav in workspace
- **Desktop:** `md` and above (≥ 768px) — existing side-by-side layouts unchanged
- All mobile layout changes use Tailwind's `md:` prefix to progressively enhance to desktop

---

## 3. Document Generator — Form/Preview Tabs

Applies to both free pages (`/invoice`, `/quotation`, `/receipt`) and the premium workspace generator.

**Mobile layout:**
- Two tabs at the top: **Form** | **Preview** — Form is the default active tab
- Only the active tab's panel is rendered (no wasted render on hidden panel)
- Tab state: `activeTab: "form" | "preview"` in local component state
- Swipe left/right between tabs using a touch handler (touchstart/touchend delta > 50px triggers tab switch)
- Action bar (Save, Export PDF) is always visible, pinned to the bottom of the screen on both tabs via `fixed bottom-0`
- Template picker inside the Form tab renders as a horizontally scrollable grid

**Desktop layout (`md:`):**
- Tabs hidden (`md:hidden`)
- Existing `grid-cols-[400px_1fr]` side-by-side layout restored
- Action bar returns to its current inline position

**Document preview scaling:**
- On mobile, the A4 preview (210mm × 297mm) is scaled via `transform: scale(x)` where `x = (viewport width - padding) / 794px` (794px = A4 at 96dpi)
- Scale is calculated on mount and on window resize via a `useEffect`

**Affected files:**
- `components/generator/document-generator.tsx` — tab state, swipe handler, conditional layout
- `components/generator/preview-panel.tsx` — add scale transform on mobile
- `components/generator/action-bar.tsx` — pin to bottom on mobile

---

## 4. Premium Workspace — Bottom Navigation

**Mobile layout:**
- Left sidebar hidden on mobile (`md:hidden`)
- Bottom navigation bar always visible, fixed to bottom: `fixed bottom-0 inset-x-0`
- 4 nav items: **Businesses**, **Customers**, **History**, **Items** — each with an icon and label
- Active item highlighted (matches existing amber accent `#d4901e`)
- Bottom nav sits above the action bar — action bar gets `pb-[56px]` to avoid overlap when both are visible
- The right-side template/color picker panel (`w-[180px]`) renders inline inside the Form tab's scroll area on mobile (below the form fields), rather than as a separate fixed column

**Desktop layout (`md:`):**
- Bottom nav hidden (`md:hidden`)
- Existing sidebar and right panel restored

**New file:**
- `components/workspace/mobile-bottom-nav.tsx` — self-contained bottom nav component

**Affected files:**
- `app/(workspace)/workspace/[kind]/page.tsx` — integrate bottom nav, hide sidebar on mobile, collapse right panel

---

## 5. Typography, Spacing & Touch Targets

- All buttons and tappable elements: `min-h-[44px]`
- Line item rows: minimum `py-3` for easy tap-to-edit
- Form horizontal padding: `px-4` on mobile (some sections currently use `px-5`/`px-7`)
- Action bar buttons compress or stack gracefully below `sm` (375px)
- Template picker grid items get explicit `min-h-[44px]` tap areas

**Affected files:**
- `components/generator/document-form.tsx`
- `components/generator/document-generator.tsx`
- Workspace modal components (minor touch target fixes): `business-form-modal.tsx`, `customer-form-modal.tsx`, `item-form-modal.tsx`, `confirm-workspace-action-modal.tsx`

---

## 6. Site Header & Landing Page

These are already partially responsive. Changes are spot fixes only:

- `components/site/site-header.tsx` — verify nav links collapse correctly, CTA buttons remain visible
- `app/page.tsx` — padding/font size spot fixes only
- `app/profile/page.tsx` — minor touch target fixes
- Auth, upgrade, and success pages — no changes needed

---

## 7. PWA Support

**Manifest (`public/manifest.json`):**
- `name`: "Quodo"
- `short_name`: "Quodo"
- `start_url`: "/"
- `display`: "standalone"
- `background_color`: "#111111"
- `theme_color`: "#d4901e"
- Icons: 192×192 and 512×512 — generated from the existing favicon/logo assets in `public/`

**Service worker (`public/sw.js`):**
- Cache-first strategy for static assets (fonts, icons, JS bundles)
- Network-first for all API routes and page navigation
- Registered in `app/layout.tsx` via a `<Script>` tag

**Meta tags in `app/layout.tsx`:**
- `<link rel="manifest" href="/manifest.json" />`
- `<meta name="theme-color" content="#d4901e" />`
- `<meta name="apple-mobile-web-app-capable" content="yes" />`
- `<meta name="apple-mobile-web-app-title" content="Quodo" />`
- Apple touch icon link

**New files:**
- `public/manifest.json`
- `public/sw.js`
- `public/icons/icon-192.png`
- `public/icons/icon-512.png`

**Affected files:**
- `app/layout.tsx` — add manifest link, meta tags, service worker registration

---

## 8. Testing & Acceptance Criteria

- [ ] No horizontal scroll at 375px on any page
- [ ] Form/Preview tabs switch correctly on free and workspace generator pages
- [ ] Swipe left/right switches tabs on mobile
- [ ] Action bar stays pinned and visible on both tabs
- [ ] Bottom nav highlights active workspace section correctly
- [ ] PDF export completes successfully on mobile (Chrome devtools mobile emulation)
- [ ] Document preview scales to fit viewport without clipping
- [ ] All buttons meet 44px minimum tap target
- [ ] App is installable via browser "Add to Home Screen" prompt
- [ ] PWA loads correctly when launched from home screen
- [ ] Test at 375px (iPhone SE) and 390px (iPhone 14)

---

## 9. Out of Scope

- Native app (iOS/Android)
- Offline-first functionality beyond static asset caching
- Changes to PDF output format or dimensions
- Mobile-specific onboarding or feature gating
