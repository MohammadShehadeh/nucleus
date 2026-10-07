---
name: testing-patterns
description: How tests are written and run in Nucleus - Vitest, colocated *.test.ts files for pure lib logic (e.g. packages/db/src/rbac), which packages have a test script, and how to add one. Use when writing or running tests or adding a test setup to a package.
---

# Testing Patterns

Code style follows the `pxkit:pxkit-conventions` skill; this skill covers repo-specific patterns. On conflict, pxkit wins. (pxkit reference: `testing.md`.)

## Current state

- Runner: **Vitest** (version from the pnpm `catalog:`).
- Only `@nucleus/db` has tests today:
  - `packages/db/src/rbac/check.test.ts` - `hasPermission` / `hasAllPermissions` / `hasAnyPermission` incl. wildcard.
  - `packages/db/src/rbac/permissions.test.ts` - permission catalog integrity.
  - Config: `packages/db/vitest.config.ts` (`environment: "node"`, `include: ["src/**/*.test.ts"]`).
- Scripts: `pnpm test` (root, `turbo run test`) runs every package with a `test` script; `pnpm -F @nucleus/db test` / `test:watch` for one package.
- No Playwright, Testing Library, or msw setup exists. Don't write tests that assume them without adding the setup first (and confirming with the user).

## What to test

Separate decisions from actions: test the **pure logic** - permission checks, parsers, slug/sort/filter builders, mappers, zod schemas. Don't unit-test thin wiring (tRPC procedures that just query, components that just render).

When router logic gets non-trivial (e.g. `slugify` or `orderBy` building in `packages/api/src/router/roles.ts`), extract it to a pure function and test that; keep it in the router file until a second consumer appears, and test it via export.

## Shape

Colocated sibling file, BDD naming, explicit imports from `vitest`:

```ts
// packages/db/src/rbac/check.test.ts
import { describe, expect, it } from "vitest";
import { hasPermission } from "./check";
import { WILDCARD_PERMISSION } from "./permissions";

describe("hasPermission", () => {
  it("returns true for any permission when the wildcard is granted", () => {
    expect(hasPermission([WILDCARD_PERMISSION], "user:assign-role")).toBe(true);
  });

  it("returns false for an empty grant list", () => {
    expect(hasPermission([], "role:read")).toBe(false);
  });
});
```

- Import the defining file (`./check`), never a barrel.
- Cover the unhappy path and edges (empty lists, wildcard, duplicates).
- No DB, Redis, or network in unit tests; if logic needs them, split the pure part out.

## Adding tests to another package

1. Add `"vitest": "catalog:"` to `devDependencies`.
2. Add scripts `"test": "vitest run"` and `"test:watch": "vitest"`.
3. Add a `vitest.config.ts` like `packages/db/vitest.config.ts` (`environment: "jsdom"` only if testing DOM code, which then also needs the jsdom/Testing Library deps).
4. `turbo.json` already defines the `test` task - nothing to add there.

## Done criteria

`pnpm typecheck`, `pnpm format-and-lint`, and `pnpm test` pass.
