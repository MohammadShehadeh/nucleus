import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { authRoutes, protectedRoutes } from "@/constants/routes";

export function middleware(request: NextRequest) {
  // This middleware provides optimistic redirects
  // Full authentication checks are performed within each page/route handler
  const cookies = getSessionCookie(request);

  // Check if the requested URL matches any protected route patterns
  const isProtectedRoute = () => {
    return protectedRoutes.some((path) => request.nextUrl.pathname.startsWith(path));
  };

  // Check if the requested URL matches any authentication route patterns
  const isAuthRoute = () => {
    return authRoutes.some((path) => request.nextUrl.pathname.startsWith(path));
  };

  // Handle route protection and redirects
  if ((isProtectedRoute() && !cookies) || (isAuthRoute() && cookies)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     * - static (static files)
     * - public (public files)
     * - favicon.ico (favicon file)
     * - assets (assets)
     * - images (images)
     * - icons (icons)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)",
  ],
};
