# Quo — Document Generator

A professional document generator for quotations, invoices, and receipts. Built with Next.js 15 and Supabase.

## Features

- Generate **quotations**, **invoices**, and **receipts** instantly
- Multiple document templates — Modern, Edge, Classic, Bold
- Theme customization with accent colors
- PDF export with multi-page support
- Logo upload support
- Payment terms and tax configuration
- Free tier for anonymous and signed-in users
- **Premium** workspace with multi-business management, saved customers, and document history

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Auth & Database:** Supabase Auth + PostgreSQL
- **Forms:** react-hook-form + Zod
- **Styling:** Tailwind CSS
- **PDF Export:** html2canvas + jsPDF
- **Testing:** Vitest (unit/component), Playwright (e2e)

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### Installation

```bash
git clone https://github.com/your-username/quo.git
cd quo
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
npm run test:unit    # Run Vitest unit & component tests
npm run test:e2e     # Run Playwright e2e tests
npx tsc --noEmit     # Type check
```

## Project Structure

```
app/
  (auth)/            # Login & auth pages
  (workspace)/       # Premium workspace routes
  api/               # API routes (account, businesses, customers, documents)
  invoice/           # Free invoice page
  quotation/         # Free quotation page
  receipt/           # Free receipt page
components/
  documents/         # Document templates & rendering
  generator/         # Document editor UI
  premium/           # Upsell modals & premium UI
  workspace/         # Workspace management UI
lib/
  documents/         # Pagination, PDF export, calculations, formatting
  workspace/         # Session, plan, and account helpers
  supabase/          # Supabase client setup
tests/
  unit/              # Unit tests
  component/         # Component tests
  e2e/               # Playwright end-to-end tests
```

## Free vs Premium

| Feature | Free | Premium |
|---|---|---|
| Generate documents | ✓ | ✓ |
| All templates | ✓ | ✓ |
| PDF export | ✓ | ✓ |
| Multiple businesses | — | ✓ |
| Saved customers | — | ✓ |
| Document history | — | ✓ |

Premium plan is managed server-side via Supabase `user_profiles` table.

## License

MIT
