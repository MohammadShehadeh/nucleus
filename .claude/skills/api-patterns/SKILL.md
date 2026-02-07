---
name: api-patterns
description: Provides guidelines for tRPC API development. Use when creating or modifying tRPC API endpoints, routers, and procedures.
---

# tRPC API Development Guidelines

## Router Structure
- Create dedicated routers for each domain entity (e.g., `user`, `auth`) in `packages/api/src/router/`.
- The main `appRouter` in `packages/api/src/root.ts` should combine these smaller routers.
- Export routers with descriptive names following the `{entity}Router` pattern.
- Satisfy the `TRPCRouterRecord` type for proper typing.

## Procedure Patterns
- Use `publicProcedure` for unauthenticated endpoints.
- Use `protectedProcedure` for endpoints that require an authenticated session.
- Always validate inputs using the Zod schemas generated from the database models in `@nucleus/db/schema`.

*Hypothetical example for a `userRouter`:*
```typescript
import { userInsertSchema, userSelectSchema } from "@nucleus/db/schema";
import { db } from "@nucleus/db";
import { eq } from "drizzle-orm";

export const userRouter = {
  create: publicProcedure // Or protectedProcedure depending on logic
    .input(userInsertSchema)
    .mutation(async ({ input }) => {
      // In a real scenario, you'd hash the password here
      return await db.insert(user).values(input).returning({ id: user.id, email: user.email });
    }),
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return db.query.user.findFirst({
        where: eq(user.id, input.id),
      });
    }),
} satisfies TRPCRouterRecord;
```

## Input Validation Patterns
- Use complete `Insert` schemas for create operations: `.input(userInsertSchema)`
- Use modified schemas for updates, e.g., making certain fields required: `.input(userInsertSchema.pick({ name: true, email: true }))`
- Use Zod's object constructor for simple query inputs: `.input(z.object({ id: z.string() }))`

## Database Operations
- Import `db` from `@nucleus/db` to use the Drizzle query client.
- Import query builders (`eq`, `and`, `or`, etc.) from `drizzle-orm`.
- Import table and Zod schemas from `@nucleus/db/schema`.
- Always use `TRPCError` for handling expected errors like `NOT_FOUND` or `UNAUTHORIZED`.

## Error Handling
```typescript
import { TRPCError } from "@trpc/server";

// ... inside a query or mutation
const user = await db.query.user.findFirst({ where: eq(user.id, input.id) });

if (!user) {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: "User not found",
  });
}
```

## Query Patterns
- Prefer Drizzle's query API (`db.query.user.findFirst`) for selecting records.
- Use `.limit(1)` if using the older `db.select().from()` syntax for a single record query.
- Always handle potential `null` or `undefined` results from database queries.

## Context (`ctx`) Patterns
- Access the database client via `ctx.db`.
- Access the authenticated session via `ctx.session` (available in `protectedProcedure`).
- Access the user object via `ctx.session.user`.
- Access request headers via `ctx.headers`.
