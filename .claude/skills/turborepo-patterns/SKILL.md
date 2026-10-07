---
name: turborepo-patterns
description: Turborepo + pnpm workflow for Nucleus - the real root scripts (dev, dev:next, format-and-lint, typecheck, test, db:push/seed/studio, auth:generate, ui-add, dep:check), turbo filters, turbo.json tasks, catalog/workspace dependencies, and adding a package with per-file subpath exports. Use when running scripts, adding dependencies or packages, or editing turbo.json.
---

# Turborepo Workflow

Code style follows the `pxkit:pxkit-conventions` skill; this skill covers repo-specific patterns. On conflict, pxkit wins.

## Root scripts (`package.json`)

```bash
pnpm dev                    # turbo watch dev --continue (all apps)
pnpm dev:next               # Next.js app + its workspace deps
pnpm build                  # turbo run build

pnpm format-and-lint        # biome check .
pnpm format-and-lint:fix    # biome check . --write
pnpm typecheck              # turbo run typecheck
pnpm test                   # turbo run test (only packages with a test script; today @nucleus/db)

pnpm db:push                # drizzle-kit push (via @nucleus/db, loads ../../.env)
pnpm db:seed                # run idempotent seeders (RBAC roles)
pnpm db:studio              # Drizzle Studio
pnpm auth:generate          # better-auth CLI schema generation

pnpm ui-add                 # shadcn add into @nucleus/ui (+ import fix + format)
pnpm dep:check              # sherif workspace lint (also runs on postinstall)

pnpm clean                  # remove root node_modules
pnpm clean:workspaces       # turbo run clean in every package
```

Done criteria for any change: `pnpm typecheck`, `pnpm format-and-lint`, `pnpm test`. Husky + lint-staged run on commit.

## Filters

```bash
pnpm -F @nucleus/db test               # one package script
turbo run typecheck -F @nucleus/api    # one package task
turbo run build -F @nucleus/nextjs...  # package + its dependencies
turbo run test -F ...@nucleus/db       # package + its dependents
```

## turbo.json

- `build` depends on `^build`; outputs `dist/**`, `.next/**`, `.cache/tsbuildinfo.json`.
- `typecheck` and `test` depend on `^topo` and `^build`.
- `dev`, `studio` persistent/uncached; `push`, `seed`, `ui-add` interactive/uncached.
- `//#format-and-lint` runs Biome at the root.
- A new env var used at build time must be added to `globalEnv` (secrets/config) or `globalPassThroughEnv`.

## Dependencies

- Internal: `"@nucleus/<pkg>": "workspace:*"`.
- Shared external versions: `"catalog:"` (default catalog in `pnpm-workspace.yaml`: zod, trpc, tanstack query, better-auth, next, vitest, ...) or `"catalog:react19"` for React.
- Add with `pnpm -F <pkg> add <dep>`; run `pnpm dep:check` after.
- One version per dependency across the workspace (sherif enforces).

## Adding a package

1. `packages/<name>/` with `package.json` named `@nucleus/<name>`, `"type": "module"`, `"private": true`.
2. Scripts mirroring siblings: `build`/`dev` (`tsc`), `clean`, `format-and-lint`, `format-and-lint:fix`, `typecheck`, and `test` if it has tests.
3. `tsconfig.json` extending `@nucleus/tsconfig` (see a sibling, e.g. `packages/validators/tsconfig.json`).
4. **Per-file subpath exports, no `index.ts` barrel** - follow `packages/ui/package.json` / `packages/validators/package.json`:

```jsonc
"exports": {
  "./*": { "types": "./dist/*.d.ts", "default": "./src/*.ts" }
}
```

5. Env vars -> `env.ts` factory exported as `./env`, then `extends` it in `apps/nextjs/src/env.ts` (see `env-config-patterns`).
6. Only create a package for code with 2+ consumers (apps or packages); single-consumer code stays where it is used.

## Troubleshooting

- Stale types across packages: `pnpm typecheck` (builds `^build` first) or `turbo run build -F <pkg>...`.
- Force no cache: append `--force`.
- Lockfile drift: `pnpm install` from the root.
