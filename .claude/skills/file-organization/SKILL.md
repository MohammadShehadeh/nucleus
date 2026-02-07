---
name: file-organization
description: Details file and folder organization conventions. Use as a reference for project structure and where to place new files.
---

# File Organization Guidelines

## Naming Conventions
- Use **kebab-case** for file and folder names (e.g., `user-management`, `course-form.tsx`).
- Use **PascalCase** for React components (e.g., `LoginForm`, `CourseCard.tsx`).
- Use **camelCase** for general functions and variables (e.g., `createCourse`, `userId`).
- Use **SCREAMING_SNAKE_CASE** for constants (e.g., `DATABASE_URL`, `API_BASE_URL`).

## Directory Structure Patterns

### Apps Structure
The `apps/` directory contains the runnable applications.
```
apps/nextjs/src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth route group (e.g., /sign-in)
│   ├── (protected)/       # Protected route group (requires login)
│   ├── (public)/          # Public route group (e.g., landing page)
│   └── api/               # API routes (e.g., tRPC)
├── auth/                  # Auth configuration files
├── components/            # App-specific shared components
├── lib/                   # App-specific utilities
└── trpc/                  # tRPC client setup
```

### Package Structure
The `packages/` directory contains shared code, organized by domain.
```
packages/{package-name}/
├── src/
│   ├── index.ts          # Main export file for the package
│   └── ...               # Feature files
├── package.json
└── tsconfig.json
```

## Import/Export Patterns
- Use barrel exports (`export * from './file'`) in `index.ts` files to create a clean public API for each package.
- Prefer named exports over default exports to maintain consistency.
- Group imports in this order:
  1. React/Next.js imports
  2. External library imports
  3. Internal workspace imports (`@nucleus/...`)
  4. Relative imports (`~/...`, `./...`, `../...`)
- Always use absolute imports with workspace aliases (`@nucleus/db`, `@nucleus/ui`) when crossing package boundaries.

## Route Organization
- Use Next.js route groups (`(auth)`) for organizing routes that share a layout or context, without affecting the URL.
- Place components shared within a route group inside that group's folder (e.g., `app/(protected)/components/`).
- Keep page-specific logic as close to its `page.tsx` file as possible.

## Component Co-location
- If a component is only used on one page, define it in the same file or a file next to the page.
- If a component is used by multiple pages within the same route group, place it in a shared `components` folder for that group.
- If a component is used across multiple route groups or apps, promote it to the shared `@nucleus/ui` package.
