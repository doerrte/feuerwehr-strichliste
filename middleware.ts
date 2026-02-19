import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const userId = request.cookies.get("userId")?.value;

  const isLoginPage = request.nextUrl.pathname === "/login";

  if (!userId && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (userId && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
