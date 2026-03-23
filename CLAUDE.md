# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # Start dev server with Turbopack
npm run build         # Build for production
npm run lint          # Run ESLint
npm run test          # Run Vitest in watch mode
npm run test:run      # Run tests once (CI mode)
npm run test:ui       # Open Vitest UI on port 5123
npm run test:coverage # Generate coverage report
```

To run a single test file:
```bash
npx vitest run tests/path/to/file.test.ts
```

## Architecture

### ResourceApi — Generic CRUD Base

`src/data/class/ResourceApi.ts` is the central abstraction. Every domain entity (clients, documents, companies…) has a class that extends it. It wraps PostgREST (Supabase) and handles:
- Pagination (page + pageSize → offset/limit)
- Filtering (`FilterOps`: eq, neq, gt, gte, lt, lte, ilike, in, or)
- Sort whitelisting (prevents SQL injection via column allow-list)
- Protected columns (auto-stripped on writes)
- Bulk operations (`upsertMany`, `bulkDelete`)
- Default filters (used to scope all queries to `company_id`)
- AbortSignal support for cancellable requests

Domain APIs live in `src/data/class/<domain>/` and extend ResourceApi. `src/data/class/index.ts` re-exports all of them.

> **Note:** `src/data/createResourceApi.ts` is deprecated. Do not use it for new code — extend `ResourceApi` instead.

### Aggregate Pattern

For operations spanning multiple tables, `*Aggregate` classes in `src/data/class/<domain>/` orchestrate parallel fetches and transactional writes. Example: `ClientsAggregate` fetches client + addresses + contacts in parallel and handles cascading deletes.

### Feature Modules

Each domain lives in `src/features/<domain>/` with a consistent internal structure:
- `components/` — UI components (dialogs, forms, tables)
- `data/` — Repository functions that wrap the domain API classes from `src/data/class/<domain>/`
- `hooks/` — React hooks (e.g., `useClientsTable`)
- `schemas/` — Domain-specific Zod schemas + inferred TypeScript types

### Schemas

Schemas exist in two locations:
- `src/schemas/` — Global shared schemas (currencies, payments, email_logs, settings, users…)
- `src/features/<domain>/schemas/` — Domain-specific schemas used within a feature

Each schema file typically exports a strict DB schema and a permissive form schema. TypeScript types are derived via `z.infer<typeof schema>`.

### Page → Data Flow

```
Page component
  └─ useDataTable(fetcherFn, initialParams)   // src/hooks/useDataTable.ts
      └─ Repository function                   // src/features/<domain>/data/*.repository.ts
          └─ Domain API class                  // src/data/class/<domain>/*Api.ts
              └─ ResourceApi (PostgREST)       // src/data/class/ResourceApi.ts
```

`useDataTable` manages loading state, pagination params, race-condition tracking, and a `refresh()` trigger. All list pages follow this pattern.

### Multi-tenancy

Every query is scoped to `company_id`. The `defaultFilters` option on ResourceApi instances enforces this automatically — never build queries without passing `companyId` through.

### Activity Logging

All CRUD operations log to an activity journal via `src/data/logs.ts`. This is integrated into ResourceApi and the repository layer — no need to call it manually in new features that use these abstractions.

### Supabase Clients

- Browser: singleton in `src/data/supabase/client.ts`
- Server (API routes / RSC): `createClientServer()` in `src/data/supabase/server.ts`
- Middleware: `src/middleware.ts` — protects `(private)` routes, handles auth redirects

### Testing

Tests live in `tests/` mirroring the source structure. Supabase is mocked via `tests/mocks/` — never use the real client in unit tests. Use `vi.fn()` for mocks and Vitest's `describe/it/expect` globals.

### Conventions

- French-first UI strings (`DEFAULT_LANGUAGE = "fr"` in `src/lib/constants.ts`)
- Error responses: `{ ok: false, error: { code, message, traceId } }`
- Commit style uses emoji prefixes (see CONTRIBUTING.md)
- App Router routes: `(private)` = auth-protected, `(public)` = unauthenticated
