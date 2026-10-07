---
name: schema-validation
description: Zod (zod/v4) validation in Nucleus - drizzle-zod schemas generated next to tables, shared client/server schemas in @nucleus/validators, tRPC inputs, and react-hook-form with zodResolver + Controller + Field/FieldGroup/FieldError. Use when writing a zod schema, a tRPC input, or a form.
---

# Schema Validation

Code style follows the `pxkit:pxkit-conventions` skill; this skill covers repo-specific patterns. On conflict, pxkit wins. (pxkit reference: `forms.md`.)

## Import

Always `import { z } from "zod/v4";` (zod 4 via the pnpm catalog). Use v4 APIs: `z.email()`, `z.url()`, `z.flattenError()`.

## Where schemas live (priority order)

1. **Drizzle-generated** - `createInsertSchema` / `createSelectSchema` next to the table in `packages/db/src/schema/<file>.ts` (`userInsertSchema`, `userSelectSchema`). Use for CRUD inputs; derive with `.pick()` / `.omit()` / `.extend()` (`userSelectSchema.pick({ id: true })`).
2. **Shared client + server** - `packages/validators/src/<topic>.ts`, imported per file: `@nucleus/validators/authentication` (`loginSchema`, `registerSchema`, `resetPasswordSchema`), `@nucleus/validators/data-table`. Export the inferred type beside it: `export type LoginFormData = z.infer<typeof loginSchema>;`.
3. **Single consumer** - declare it in that file (router input like `createRoleInput` in `packages/api/src/router/roles.ts`; form schema like `roleFormSchema` in `role-form-dialog.tsx`). Move it to `@nucleus/validators` only when a second file needs it.

Never hand-write a type a schema already defines - `z.infer`.

## tRPC inputs

```ts
const updateRoleInput = z.object({
  id: z.string(),
  name: z.string().min(1).max(50).optional(),
  permissions: z.array(permissionKeySchema).optional(),
});

update: requirePermission("role:update").input(updateRoleInput).mutation(...)
```

Input failures surface automatically as `VALIDATION_FAILED` with `data.zodError` (see `error-handling-patterns`). Server-only schemas need no messages.

## Validation messages

Field messages are short English copy defined **once in the schema** (single-language app; the i18n package is not wired into forms), rendered through `FieldError`. Keep them brief and consistent with `packages/validators/src/authentication.ts` ("Email is required", "Password must be at least 6 characters"). Submit/server failures are **not** schema messages - they come from `errorKey` via `getErrorMessage`.

Cross-field rules use `.refine` with a `path`:

```ts
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

## Forms

react-hook-form + `zodResolver` (`@hookform/resolvers/zod`) + `mode: "onTouched"`; markup is `FieldGroup` -> `Controller` -> `Field` from `@nucleus/ui/components/field`. Reference: `apps/nextjs/src/app/(auth)/login/page.tsx`, `apps/nextjs/src/app/dashboard/roles/_components/role-form-dialog.tsx`.

```tsx
const form = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
  mode: "onTouched",
  defaultValues: { email: "", password: "" },
});

<form onSubmit={form.handleSubmit(handleSubmit)}>
  <FieldGroup>
    <Controller
      control={form.control}
      name="email"
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor="login-email">Email</FieldLabel>
          <Input {...field} id="login-email" type="email" aria-invalid={fieldState.invalid} />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
    <Button type="submit" disabled={form.formState.isSubmitting}>Login</Button>
  </FieldGroup>
</form>
```

- `data-invalid` on `Field` **and** `aria-invalid` on the control.
- Checkbox/radio groups: `FieldSet` + `FieldLegend` (see the permissions picker in `role-form-dialog.tsx`).
- Guard double submits with `form.formState.isSubmitting` or the mutation's `isPending`.
- Don't use the legacy `Form`/`FormField`/`FormItem`/`FormMessage` wrappers or `standardSchemaResolver` in new code; don't lay out fields with `div` + `space-y-*`.
