---
name: schema-validation
description: Describes schema validation patterns using Drizzle and Zod. Use when creating or validating data against database schemas, in forms, or in APIs.
---

# Schema Validation Guidelines

## Database Schema Patterns
- Database schemas are defined using Drizzle ORM in [packages/db/src/schema/](mdc:packages/db/src/schema/)
- Always generate Zod schemas from Drizzle schemas using `createInsertSchema` and `createSelectSchema` from `drizzle-zod`.
- These are exported from the same file where the table is defined (e.g., `packages/db/src/schema/user.ts`).

Example from [packages/db/src/schema/user.ts](mdc:packages/db/src/schema/user.ts):
```typescript
export const userInsertSchema = createInsertSchema(user);
export const userSelectSchema = createSelectSchema(user);
```

## Form Validation Patterns
- For React Hook Form validation, import the generated Zod schemas from `@nucleus/db/schema`.
- When more specific validation is needed (e.g., password confirmation), create a new schema in `packages/validators/src` that extends the base database schema.
- Use `standardSchemaResolver` from `@hookform/resolvers/standard-schema` for Zod v4 compatibility.

Example from [apps/nextjs/src/app/(auth)/components/login-form.tsx](mdc:apps/nextjs/src/app/(auth)/components/login-form.tsx):
```typescript
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { loginSchema } from "@nucleus/validators/authentication";

const form = useForm<LoginFormData>({
  resolver: standardSchemaResolver(loginSchema),
});
```

## API Input Validation
- tRPC procedures **must** use the generated Zod schemas for input validation to ensure end-to-end type safety.
- Import schemas from `@nucleus/db/schema` in your API routers.
- Use Zod methods like `.pick()`, `.omit()`, or `.extend()` to modify schemas for specific procedures.

Example from a hypothetical `userRouter`:
```typescript
import { userInsertSchema } from "@nucleus/db/schema";

// ...

create: publicProcedure
  .input(userInsertSchema)
  .mutation(async ({ input }) => {
    // `input` is fully typed and validated against the `user` table structure
    return await db.insert(user).values(input).returning();
  }),
```

## Schema Creation Priority
1. **Use generated database schemas directly** from `@nucleus/db/schema` for all CRUD operations.
2. **Create specific schemas in `@nucleus/validators`** only when you need complex validation not present in the DB schema (e.g., password confirmation, multi-field validation). These schemas should `extend()` or `pick()` from the base DB schemas to avoid duplicating logic.
3. **Never duplicate validation logic.** Always derive from the single source of truth in the database schema.

## Advanced Schema Patterns
- Use `.pick()` to select specific fields: `userSelectSchema.pick({ id: true, name: true, email: true })`
- Use `.omit()` to exclude sensitive fields: `userSelectSchema.omit({ emailVerified: true })`
- Use `.extend()` to add additional fields for form validation: `userInsertSchema.extend({ confirmPassword: z.string() })`

## Custom Validation Messages
When creating specific schemas in `packages/validators`, you can add custom messages.
```typescript
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters long."),
});
```

## Conditional Validation
Use `.refine()` for validation that depends on multiple fields.
```typescript
const userUpdateSchema = userSelectSchema
  .pick({ name: true, image: true })
  .extend({
    isPublic: z.boolean(),
  })
  .refine(
    (data) => (data.isPublic ? data.image !== null : true),
    {
      message: "A profile image is required for public profiles.",
      path: ["image"], // Field that the error is associated with
    }
  );
```