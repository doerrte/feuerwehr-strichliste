import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Nur Basis-Schutz, KEIN Redirect auf Login hier
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};