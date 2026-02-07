---
name: database-patterns
description: Defines database schema, migration, and query patterns. Use when creating or modifying database tables, generating schemas, or writing queries.
---

# Database Development Guidelines

## Schema Definition Patterns
- Use Drizzle ORM with PostgreSQL
- Define tables using `pgTable` in [packages/db/src/schema/](mdc:packages/db/src/schema/)
- Follow consistent column patterns:
  - `id: t.text().primaryKey()` for primary keys
  - `createdAt: t.timestamp().notNull().defaultNow()` for creation timestamps
  - `updatedAt: t.timestamp({ mode: "date", withTimezone: true }).$onUpdateFn(() => new Date())` for update timestamps

## Zod Schema Generation
Always generate Zod schemas from Drizzle schemas using `drizzle-zod`. This creates a single source of truth for validation across the database, API, and frontend. These are now generated directly in the schema files (e.g. `user.ts`).

```typescript
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// Example from packages/db/src/schema/user.ts
export const userInsertSchema = createInsertSchema(user);
export const userSelectSchema = createSelectSchema(user);
```

## Foreign Key Patterns
- Use proper foreign key references: `.references(() => parentTable.id)`
- Include proper types for foreign keys matching the referenced column
- Consider cascade behaviors for deletions

Example from [packages/db/src/schema/user.ts](mdc:packages/db/src/schema/user.ts):
```typescript
userId: t
  .text()
  .notNull()
  .references(() => user.id, { onDelete: "cascade" }),
```

## Relations Definition
- Define relations in separate files under `schema/relations/`
- Use Drizzle relations API for proper joins
- Export relation schemas for use in queries

## Migration Guidelines
- This project currently uses `pnpm db:push` to directly sync schema changes with the database. This is suitable for development and prototyping.
- For production environments, a migration-based workflow is recommended. Drizzle supports this with the `pnpm drizzle-kit generate` command, which would need to be added to `package.json`.
- Review generated SQL before applying any schema changes.
- Keep schema definition files in version control.

## Type Safety
- Export TypeScript types using Drizzle's inferred types: `export type User = typeof user.$inferSelect;`
- Use `z.infer<typeof schema>` for Zod schema types
- Ensure consistent typing across database, API, and frontend layers