import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const userId = req.cookies.get("userId")?.value;

  // 🔒 Dashboard schützen
  if (pathname.startsWith("/dashboard")) {
    if (!userId) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // 🔁 Login blockieren wenn bereits eingeloggt
  if (pathname === "/login") {
    if (userId) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};