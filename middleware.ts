import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const userId = req.cookies.get("userId")?.value;

  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");

  if (isDashboard && !userId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};