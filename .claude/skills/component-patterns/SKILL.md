---
name: component-patterns
description: Contains React component patterns and UI guidelines. Use when creating or modifying React components, especially forms and UI elements.
---

# Component Development Guidelines

## UI Component Usage
- Use components from `@nucleus/ui/components` (shadcn/ui based)
- Always import utility function `cn` from `@nucleus/ui/lib/utils` for className concatenation
- Prefer composition over complex prop interfaces

## Form Components
- Use the `Form` component wrapper from `@nucleus/ui/components/form`
- Structure forms with `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`
- Always provide proper TypeScript types for form data

Example pattern from [apps/nextjs/src/app/(auth)/components/login-form.tsx](mdc:apps/nextjs/src/app/(auth)/components/login-form.tsx):
```typescript
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input type="email" placeholder="m@example.com" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

## Component File Structure
- Use `"use client"` directive for client components
- Export function components with PascalCase names
- Accept `className` and spread remaining props for flexibility
- Use `React.ComponentProps<"element">` for HTML element prop types

## Styling Guidelines
- Use Tailwind CSS for styling
- Leverage the design system tokens in `@nucleus/ui`
- Use `cn()` utility for conditional classes
- Follow mobile-first responsive design patterns

## Route Group Organization
Components should be organized by route groups:
- `(auth)/components/` - Authentication-related forms and UI
- `(protected)/components/` - Dashboard and authenticated user components
- `(public)/components/` - Public-facing components

## Import Organization
Order imports as follows:
1. React and Next.js imports
2. Third-party libraries
3. Internal package imports (`@nucleus/...`)
4. Relative imports (`~/...`)

## State Management Patterns
- Use React Hook Form for form state management
- Use React Query (TanStack Query) for server state via tRPC
- Use React's built-in state for local component state
- Avoid prop drilling - use context for deeply nested state

## Performance Optimization
- Use `React.memo()` for expensive components
- Implement proper loading states with Suspense boundaries
- Use `useCallback` and `useMemo` judiciously
- Lazy load components with `React.lazy()` when appropriate

## Accessibility Guidelines
- Always provide proper ARIA labels and roles
- Ensure keyboard navigation works correctly
- Use semantic HTML elements
- Test with screen readers
- Maintain proper color contrast ratios