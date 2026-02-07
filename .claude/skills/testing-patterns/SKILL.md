---
name: testing-patterns
description: Defines testing patterns and best practices for Vitest, Playwright, and React Testing Library. Use when writing any kind of test.
---

# Testing Guidelines

> **Note:** This project currently has no tests. This document serves as the official blueprint for how tests **must** be implemented. Adhere to these patterns when adding any new tests to the codebase.

## Testing Stack
This project uses the following testing tools:
- **Unit Testing**: Vitest for fast unit tests
- **E2E Testing**: Playwright for end-to-end testing
- **Component Testing**: React Testing Library with Vitest
- **API Testing**: tRPC testing utilities

## Test File Organization
Test files **should** be co-located with the code they are testing, either in a `__tests__` directory or as `.test.ts` files alongside the source.

```
src/
├── components/
│   ├── login-form.tsx
│   └── __tests__/
│       └── login-form.test.tsx
├── utils/
│   ├── helpers.ts
│   └── helpers.test.ts
```

## Unit Testing Patterns

### Component Testing
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { LoginForm } from '../login-form';

describe('LoginForm', () => {
  it('should submit form with valid data', async () => {
    const mockSignIn = vi.fn();
    vi.mock('~/auth/client', () => ({
      signIn: { email: mockSignIn }
    }));

    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: expect.any(String),
        callbackURL: '/',
      });
    });
  });
});
```

### API Testing
This example uses `msw-trpc` to mock tRPC procedures for a hypothetical `userRouter`.
```typescript
import { createTRPCMsw } from 'msw-trpc';
import { setupServer } from 'msw/node';
import type { AppRouter } from '@nucleus/api';
import { userSelectSchema } from '@nucleus/db/schema';

const trpcMsw = createTRPCMsw<AppRouter>();
const server = setupServer();

describe('User API', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should get user by id successfully', async () => {
    const fakeUser = { id: 'user_1', name: 'Test User', email: 'test@example.com' };
    
    server.use(
      trpcMsw.user.getById.query((req, res, ctx) => {
        return res(ctx.status(200), ctx.data(fakeUser));
      })
    );

    // This would be a call from a client-side test
    const result = await trpc.user.getById.useQuery({ id: 'user_1' });

    expect(result.data).toMatchObject(fakeUser);
  });
});
```

## Database Testing
```typescript
import { beforeEach, afterEach } from 'vitest';
import { db } from '@nucleus/db/client';
import { user as userTable } from '@nucleus/db/schema';
import { eq } from '@nucleus/db';

describe('User Database Operations', () => {
  const testUser = {
    id: 'test_user_1',
    name: 'DB Test User',
    email: 'db_test@example.com',
    emailVerified: false,
  };

  beforeEach(async () => {
    // Setup test data
    await db.insert(userTable).values(testUser);
  });

  afterEach(async () => {
    // Cleanup test data
    await db.delete(userTable).where(eq(userTable.id, testUser.id));
  });

  it('should find user by id', async () => {
    const result = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, testUser.id))
      .limit(1);

    expect(result[0]).toMatchObject({
      name: 'DB Test User',
      email: 'db_test@example.com',
    });
  });
});
```

## E2E Testing Patterns
```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/sign-in');
    
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Welcome')).toBeVisible();
  });
});
```

## Testing Best Practices
- **Arrange, Act, Assert**: Structure tests clearly.
- **Test behavior, not implementation**: Focus on what the user experiences.
- **Use `data-testid` for E2E**: Use them for reliable element selection in Playwright tests.
- **Mock external dependencies**: Keep tests fast and isolated. Use `vi.mock`.
- **Test error states**: Include "unhappy path" scenarios.
- **Use descriptive test names**: A test name should clearly state what it is testing.
- **Group related tests**: Use `describe` blocks for organization.