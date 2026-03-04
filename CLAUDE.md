# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build (also serves as type-check)
npm run lint     # ESLint
```

No test framework is configured.

## Architecture

**Fintrack** is a personal finance app (Spanish UI, USD/COP multi-currency). Stack: Next.js 16, React 19, TypeScript, Supabase (PostgreSQL + Auth), Tailwind CSS, shadcn/ui, Recharts.

### Routing

- `app/(dashboard)/` — Route group with shared layout (`SidebarNav` + `DashboardHeader`). Pages: dashboard, transactions, budgets, reports, cards, settings, items, help.
- `app/auth/` — Login, sign-up, forgot/update-password, OAuth callback (`callback/route.ts`), email confirm (`confirm/route.ts`).
- `app/page.tsx` — Public landing page.
- PWA enabled via `app/manifest.ts` and service worker config in `next.config.ts`.

### Data Flow

All data fetching is client-side. The pattern is:

1. **Hooks** (`hooks/use-*.ts`) call **services** (`lib/services/*.ts`) which query Supabase.
2. Hooks use a `refreshKey` + `useCallback` pattern for refetch/invalidation.
3. User state flows through `lib/context/user-context.tsx` (`UserProvider` / `useUser()`).

### Supabase

- Client: `lib/supabase/client.ts` / Server: `lib/supabase/server.ts`
- Generated types: `lib/supabase/database.types.ts`
- Schema: `supabase/schema.sql` (8 tables + `budget_progress` view)
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `DATABASE_URL`

### Forms

react-hook-form + Zod (`lib/validations/*.ts`) + zodResolver + shadcn Dialog/Form. All form dialogs live in `components/forms/`.

### Notifications

Sonner: `toast.success()` / `toast.error()` for all CRUD feedback.

## Conventions

- **Lucide icons**: Import from direct ESM paths (e.g., `lucide-react/dist/esm/icons/...`). Wildcard type declaration in `types/lucide-react.d.ts`.
- **`new Date()` in Client Components**: Wrap in `<Suspense>` boundary (Next.js 16 prerender requirement).
- **`@ts-nocheck`**: Used in Supabase service files (`.insert()`/`.update()` resolve to `never` due to generated types mismatch) and in `components/ui/chart.tsx`, `components/ui/resizable.tsx` (pre-existing shadcn type issues). Do not remove these suppressions.
- **Path alias**: `@/*` maps to project root.
- **Styling**: Tailwind with CSS variables (HSL), class-based dark mode, shadcn/ui components.
- **`example-project/`**: Excluded from tsconfig — ignore it.
