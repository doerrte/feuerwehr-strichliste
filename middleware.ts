import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const userId = req.cookies.get("userId");
  const { pathname } = req.nextUrl;

  // 🔥 Kiosk darf IMMER ohne Login erreichbar sein
  if (pathname.startsWith("/kiosk")) {
    return NextResponse.next();
  }

  // 🔐 Dashboard nur mit Login
  if (!userId && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"], // Kiosk Hier entfernen
};