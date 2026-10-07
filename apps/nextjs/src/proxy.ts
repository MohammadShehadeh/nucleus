import { Redis } from "@nucleus/cache";
import { hasPermission } from "@nucleus/db/rbac/check";
import type { PermissionKey } from "@nucleus/db/rbac/permissions";
import { RedisRateLimiter } from "@nucleus/rate-limit";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSession } from "./auth/server";

interface RoutePermission {
  prefix: string;
  permission: PermissionKey;
}

const protectedRoutes = ["/dashboard"];

const authRoutes = ["/register", "/login", "/reset-password"];

// Checked after the authentication gate: an authenticated user lacking the
// permission is bounced back to the dashboard rather than to the landing page.
const routePermissions: RoutePermission[] = [
  { prefix: "/dashboard/roles", permission: "role:read" },
  { prefix: "/dashboard/users", permission: "user:list" },
];

const rateLimiter = new RedisRateLimiter(Redis.getInstance(), {
  limit: 1000,
  window: 60_000,
});

export async function proxy(request: NextRequest) {
  const xffHeader = request.headers.get("x-forwarded-for");
  const clientIp = xffHeader?.split(",")[0] ?? "anonymous";
  const { allowed } = await rateLimiter.check(clientIp);
  const pathname = request.nextUrl.pathname;

  if (!allowed) {
    return new NextResponse("Rate limit exceeded", { status: 429 });
  }

  const session = await getSession();

  const isProtectedRoute = protectedRoutes.some((path) => pathname.startsWith(path));
  const isAuthRoute = authRoutes.some((path) => pathname.startsWith(path));

  if ((isProtectedRoute && !session) || (isAuthRoute && session)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (session) {
    const guarded = routePermissions.find((route) => pathname.startsWith(route.prefix));
    if (guarded && !hasPermission(session.user.permissions ?? [], guarded.permission)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals, the favicon, and static asset files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)",
  ],
};
