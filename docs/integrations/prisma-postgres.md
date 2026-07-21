# Prisma + PostgreSQL Integration

This document defines the boundary between the application and the PostgreSQL database via Prisma ORM.

---

## Purpose

Prisma provides type-safe database access to PostgreSQL for all portfolio content. It handles schema management, migrations, query building, and TypeScript type generation.

---

## Ownership Boundary

Application owns:

- Prisma schema definition (`prisma/schema.prisma`)
- Migration files (`prisma/migrations/`)
- Seed data (`prisma/seed.ts`)
- Query functions (`src/data/db.ts`)
- Type definitions (`src/data/types.ts`)
- Client singleton (`src/lib/prisma.ts`)

External system owns:

- PostgreSQL database server
- Connection management
- Data persistence

Do not duplicate ownership across both sides.

---

## Configuration

Environment values:

```text
DATABASE_URL — PostgreSQL connection string (required)
```

Source:

`.env` file (development) or environment variables (production)

Never document actual secret values.

---

## Runtime Flow

```text
Server Component / Server Action
→ Data Access Function (src/data/db.ts)
→ Prisma Client (src/lib/prisma.ts)
→ PrismaPg Adapter (@prisma/adapter-pg)
→ pg driver
→ PostgreSQL
```

---

## Request Contract

Inputs:

- Prisma schema (model definitions)
- TypeScript types (generated from schema)
- Query parameters (where, include, orderBy, take, skip)

---

## Response Contract

Success:

Typed JavaScript objects matching schema. Relations included via `include` option.

Failure:

Prisma exceptions (`PrismaClientKnownRequestError`, etc.) caught by error boundaries.

Retry:

No automatic retry. Application fails gracefully via `error.tsx`.

---

## Client Singleton Pattern

```typescript
// src/lib/prisma.ts
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

Purpose:

- Prevents multiple Prisma client instances during Next.js hot reload in development
- Production creates a new client per cold start (no globalThis caching)

---

## Adapter Configuration

```typescript
const adapter = new PrismaPg({ connectionString });
return new PrismaClient({ adapter });
```

Uses `@prisma/adapter-pg` for PostgreSQL driver adapter. Compatible with Neon serverless via `@neondatabase/serverless`.

---

## Security Boundary

Application may know:

- `DATABASE_URL` connection string
- Schema structure
- Query patterns

Application must not know:

- Database server credentials (beyond connection string)
- Database admin access

Database owns:

- Data persistence
- Connection pooling (via driver)
- Query execution

---

## Testing

Local:

- Use local PostgreSQL or Neon development database
- Run `npx prisma migrate deploy` to apply schema
- Run `npx prisma db seed` to populate test data

Production:

- Run `npx prisma migrate deploy` during deployment
- Never run seed in production (destructive)

---

## Known Limitations

- No connection pooling configuration in codebase (relies on defaults)
- No read replicas configured
- Seed is destructive (deletes all data before inserting)
- Json type fields have no runtime validation
- Singleton models (Profile, Contact, SiteSettings) have no DB-level single-row constraint

---

## Update Rules

Update when:

- Prisma schema changes
- Migration strategy changes
- Adapter configuration changes
- Connection pooling setup changes
- Seed behavior changes
