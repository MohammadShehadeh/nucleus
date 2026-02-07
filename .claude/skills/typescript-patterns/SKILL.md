---
name: typescript-patterns
description: Contains TypeScript patterns and code quality guidelines. Use as a reference for types, interfaces, and general TypeScript best practices.
---

# TypeScript Guidelines

## Type Safety Principles
- Prefer explicit types over `any`. If a type is unknown, use `unknown` and perform type checking.
- Use the strict TypeScript configuration defined in the shared `tooling/typescript/base.json`.
- Leverage type inference for local variables and function return types when it improves readability, but prefer explicit types for public APIs.
- Use branded types for domain-specific primitive values like IDs to prevent accidental mixing.

## Import Patterns
Always use consistent import styles:
```typescript
// Type-only imports should use the `import type` syntax.
import type { User } from "@nucleus/db/schema";
import type { NextRequest } from "next/server";

// Regular value imports
import { z } from "zod/v4";
import { eq } from "drizzle-orm";

// Mixed imports are discouraged, prefer separate lines.
import { createTRPCRouter } from "@nucleus/api/trpc";
import type { TRPCRouterRecord } from "@trpc/server";
```

## Zod Integration
Always import Zod from `zod/v4` for consistency across the project. Use `z.infer` to create TypeScript types from your Zod schemas.
```typescript
import { z } from "zod/v4";
import { loginSchema } from "@nucleus/validators";
import { userInsertSchema } from "@nucleus/db/schema";

// Type inference from Zod schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type UserInsert = z.infer<typeof userInsertSchema>;
```

## Function Patterns

### Async Function Types
```typescript
import { user, userInsertSchema, type User } from "@nucleus/db/schema";
import { db } from "@nucleus/db";
import { eq } from "drizzle-orm";

// Prefer explicit return types for public APIs and functions.
export async function createUser(data: UserInsert): Promise<User> {
  const newUser = await db.insert(user).values(data).returning();
  return newUser[0];
}

// Always handle potential null/undefined returns.
export async function getUserById(id: string): Promise<User | null> {
  try {
    const result = await db.query.user.findFirst({
      where: eq(user.id, id),
    });
    return result ?? null;
  } catch (error) {
    console.error("Failed to get user:", error);
    return null; // or re-throw as a domain-specific error
  }
}
```

## React Component Types

### Component Props
```typescript
import * as React from "react";
import { cn } from "@nucleus/ui/lib/utils";

// Use React.ComponentProps to inherit all standard HTML attributes.
interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: "primary" | "secondary";
}

// Use React.ReactNode for the `children` prop.
interface LayoutProps {
  children: React.ReactNode;
}

// Forward refs properly with types.
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn("base-class", variant, className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
```

## Utility Types

### Common Patterns
```typescript
import type { User } from "@nucleus/db/schema";

// Pick specific fields for a public-facing user object.
export type UserPublic = Pick<User, "id" | "name" | "image">;

// Omit sensitive fields.
export type UserSafe = Omit<User, "emailVerified">;

// Use branded types for type-safe IDs.
export type UserId = string & { readonly __brand: "UserId" };
export type CourseId = string & { readonly __brand: "CourseId" };

function example(id: UserId) { /* ... */ }
const courseId = "abc" as CourseId;
// example(courseId); // This would be a type error.
```

### Database Types
Infer types directly from your Drizzle schemas to ensure they are always in sync.
```typescript
import { type user } from "@nucleus/db/schema";

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
```

## Best Practices

### Type Guards
Use type guards to narrow down `unknown` or union types.
```typescript
import type { User } from "@nucleus/db/schema";

export function isUser(obj: unknown): obj is User {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "email" in obj &&
    typeof (obj as User).id === "string" &&
    typeof (obj as User).email === "string"
  );
}
```

### `const` Assertions
Use `as const` to create readonly arrays or objects, allowing for more specific type inference.
```typescript
export const USER_ROLES = ["student", "instructor", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number]; // "student" | "instructor" | "admin"

export const API_ENDPOINTS = {
  users: "/api/users",
  auth: "/api/auth",
} as const;
```

### Avoid Common Pitfalls
- **Don't use `any`**: Use `unknown` for unknown values and perform type checking.
- **Don't use `Function`**: Use specific function signatures like `() => void`.
- **Don't use `object` or `{}`**: Use `Record<string, unknown>` or a specific interface.
- **Always handle `null`/`undefined` cases**: Enable `strictNullChecks` and write code that accounts for these values.
