import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/accept-invitation",
  "/about",
  "/contact",
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("devboard_token")?.value;
  const { pathname } = request.nextUrl;

  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path)
  );

  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isPublicPath) {
    if (pathname.startsWith("/accept-invitation")) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
