# QUO

> Business documents, ready in minutes.

Quotations, invoices, and receipts for small businesses. Live preview, instant PDF — no setup, no learning curve, no bloat.

---

## What it does

- **Quotation** — Send a clear, itemised price estimate before work begins
- **Invoice** — Bill clients for completed work with a professional invoice
- **Receipt** — Give clients a clean record of payment once they've paid

Fill in your details. See it live. Download the PDF. Done in under 2 minutes.

---

## Features

- Live preview as you type
- Multiple templates — Modern, Edge, Classic, Bold
- Theme customization with accent colors
- Logo upload
- Multi-page PDF export
- Payment terms & tax configuration
- Notes per line item
- No account needed to start

**Premium workspace** adds multi-business management, saved customers, and document history.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Auth & DB | Supabase Auth + PostgreSQL |
| Forms | react-hook-form + Zod |
| Styling | Tailwind CSS |
| PDF Export | html2canvas + jsPDF |
| Testing | Vitest, Playwright |

---

## Getting Started

**Prerequisites:** Node.js 18+, a [Supabase](https://supabase.com) project

```bash
git clone https://github.com/your-username/quo.git
cd quo
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint
npm run test:unit    # Vitest unit & component tests
npm run test:e2e     # Playwright e2e tests
npx tsc --noEmit     # Type check
```

---

## Project Structure

```
app/
├── (auth)/            # Login & auth pages
├── (workspace)/       # Premium workspace routes
├── api/               # REST API (account, businesses, customers, documents)
├── invoice/           # Free invoice page
├── quotation/         # Free quotation page
└── receipt/           # Free receipt page

components/
├── documents/         # Templates, rendering, pagination
├── generator/         # Document editor UI
├── premium/           # Upsell modals & gated features
└── workspace/         # Workspace management UI

lib/
├── documents/         # Pagination, PDF export, calculations, formatting
├── workspace/         # Session, plan, and account helpers
└── supabase/          # Client setup

tests/
├── unit/              # Unit tests (pagination, export, calculations)
├── component/         # Component tests
└── e2e/               # Playwright end-to-end tests
```

---

## Plans

| | Free | Premium |
|---|---|---|
| Quotation, Invoice, Receipt | ✓ | ✓ |
| All templates & themes | ✓ | ✓ |
| PDF export | ✓ | ✓ |
| Multiple businesses | — | ✓ |
| Saved customers | — | ✓ |
| Document history | — | ✓ |
| Unlimited exports | — | ✓ |

Plan state is always server-controlled via Supabase `user_profiles` — never derived from auth state alone.

---

## License

MIT
