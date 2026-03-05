# MyOtherPair — Claude Context

## Project overview
Peer-to-peer marketplace for individual shoes (single feet, mismatched sizes, amputees). Turborepo monorepo.

## Stack
- **Monorepo:** Turborepo + npm workspaces
- **API:** Node.js + Express + TypeScript (`apps/api`)
- **Web:** Next.js 16 (`apps/web`)
- **Mobile:** Expo / React Native (`apps/mobile`) — scaffold only for now
- **DB:** PostgreSQL with raw SQL migrations (no ORM). Migration runner: `apps/api/src/db/migrate.ts`
- **Auth:** Supabase Auth (JWT issuance). Backend verifies tokens via `supabase.auth.getUser()` using service role key. No RLS.
- **Package manager:** npm (not pnpm or yarn)
- **Language:** TypeScript everywhere

## Workspace layout
```
myotherpair/
├── packages/types/          @myotherpair/types — shared interfaces
└── apps/
    ├── api/                 @myotherpair/api   — Express REST API, port 3001
    ├── web/                 @myotherpair/web   — Next.js 16, marketing + app
    └── mobile/              @myotherpair/mobile — Expo scaffold
```

## Key commands
```bash
# From repo root
npm install                                   # install all workspaces
npm run build                                 # turbo build (types first)
npm run dev                                   # turbo dev

# API
npm run dev --workspace=apps/api              # tsx watch
npm run db:migrate --workspace=apps/api       # run SQL migrations
npm run type-check --workspace=apps/api

# Web
npm run dev --workspace=apps/web              # next dev
npm run type-check --workspace=apps/web

# Types (must build before api/web)
npm run build --workspace=packages/types
```

## Environment setup
1. Copy `.env.example` → `apps/api/.env`
2. Fill in `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
3. Create `myotherpair` Postgres database
4. Run `npm run db:migrate --workspace=apps/api`
5. Run `npm run dev --workspace=apps/api`

## Database conventions
- Migrations live in `apps/api/src/db/migrations/` as `NNN_description.sql`
- Tracked in `_migrations` table; runner skips already-applied files
- Enums: `foot_side_enum` (L/R/single), `listing_condition_enum`, `listing_status_enum`
- `users.id` = Supabase `auth.users.id` (no auto-generate; set from JWT)
- `price` stored as `NUMERIC(10,2)` dollars — convert to cents before Stripe

## API conventions
- All responses: `{ data: T }` or `{ error: string }`
- Paginated: `{ data: T[], total, page, pageSize }`
- Auth: `Authorization: Bearer <supabase_access_token>` → `req.userId`
- Protected routes use `requireAuth` middleware from `apps/api/src/middleware/auth.ts`

## Shared types
Defined in `packages/types/src/index.ts`. Import as `@myotherpair/types`.
Must run `npm run build --workspace=packages/types` before other workspaces resolve them.

## Brand
Primary color: `#f05d23` (accent orange). Full guidelines in `BRAND.md`.
Tagline: "Every shoe deserves a match."
Target users: amputees, people with different foot sizes.

## Do not
- Use an ORM (Prisma, Drizzle, etc.) — raw SQL only
- Add RLS to Supabase — auth is done via service role key on the backend
- Use pnpm or yarn — npm workspaces only
- Generate migrations from models — write SQL by hand
