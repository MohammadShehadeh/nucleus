---
name: project-architecture
description: Provides a high-level guide to the project's monorepo architecture. Use to understand the roles of different packages and apps.
alwaysApply: true
---

# LMS Project Architecture Guide

## Monorepo Structure
This is a Turborepo monorepo with `pnpm` workspaces. The goal is to maximize code sharing and maintain a clear separation of concerns.

### `apps/`
Contains the runnable applications.
- `apps/nextjs/` - The main Next.js web application, which serves the user-facing frontend.
- `apps/expo/` - The React Native mobile application for iOS and Android.

### `packages/`
Contains all the shared logic, components, and configurations.
- `packages/api/` - The tRPC API layer. Defines all API procedures and routers.
- `packages/auth/` - Authentication logic and configuration, built on `better-auth`.
- `packages/cache/` - Caching utilities (e.g., Redis client wrapper).
- `packages/db/` - The database layer, containing the Drizzle ORM schema, client, and Zod validators. This is the single source of truth for data models.
- `packages/email/` - Email templates and sending logic.
- `packages/i18n/` - Internationalization setup and translations.
- `packages/rate-limit/` - Rate limiting middleware for the API.
- `packages/ui/` - Shared React UI components, based on `shadcn/ui`.
- `packages/upload/` - File upload utilities.
- `packages/validators/` - Complex, form-specific Zod validation schemas that extend the base schemas from `packages/db`.

### `tooling/`
Contains shared development configurations.
- `tooling/github/` - GitHub Actions workflows and templates.
- `tooling/tailwind/` - Shared Tailwind CSS configuration.
- `tooling/typescript/` - Shared `tsconfig.json` base configurations.

## Data Flow
1.  **Schema Definition**: A table is defined in `packages/db/src/schema/`. Zod schemas are automatically generated alongside it.
2.  **API Endpoint**: A tRPC router in `packages/api/src/router/` imports the Zod schema for input validation and the Drizzle client for database access.
3.  **UI Component**: A React component in `apps/nextjs/` or `packages/ui/` uses the tRPC hook (`api.user.getById.useQuery()`) to fetch data.
4.  **Form Submission**: A form uses React Hook Form with a resolver for a Zod schema imported from `packages/validators` or `packages/db`. On submit, it calls a tRPC mutation (`api.user.create.useMutation()`).

## Import Patterns
Always use workspace aliases for cross-package imports to ensure Turborepo can correctly track dependencies.
- `@nucleus/db` for database schema and client.
- `@nucleus/api` for the tRPC client (`~/trpc/react` within Next.js).
- `@nucleus/ui` for shared components.
- `@nucleus/validators` for complex validation schemas.
- `@nucleus/auth` for authentication functions.
