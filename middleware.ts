import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const userId = request.cookies.get("userId")?.value;

  console.log("MIDDLEWARE → Path:", pathname);
  console.log("MIDDLEWARE → userId:", userId);

  // 🔓 Öffentliche Routen (dürfen immer aufgerufen werden)
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/logout") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // 🔒 Alles unter /dashboard schützen
  if (pathname.startsWith("/dashboard")) {
    if (!userId) {
      console.log("❌ Kein userId → Redirect zu /login");
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // ✅ Alles andere normal durchlassen
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
