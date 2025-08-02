import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedRoutes = ["/dashboard"];
const authRoutes = ["/sign-in", "/sign-up", "/reset-password"];

export function middleware(request: NextRequest) {
  // THIS IS NOT SECURE!
  // This is the recommended approach to optimistically redirect users
  // Auth checks are handled in each page/route
  const cookies = getSessionCookie(request);

  const isProtectedRoute = () => {
    return protectedRoutes.some((path) =>
      request.nextUrl.pathname.startsWith(path),
    );
  };

  const isAuthRoute = () => {
    return authRoutes.some((path) => request.nextUrl.pathname.startsWith(path));
  };

  if (
    // If the user is not authenticated and trying to access an authenticated route (dashboard)
    (isProtectedRoute() && !cookies) ||
    // If the user is authenticated and trying to access an unauthenticated route (sign-in, sign-up, reset-password)
    (isAuthRoute() && cookies)
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
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
