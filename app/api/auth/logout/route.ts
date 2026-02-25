import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });

    // 🔥 ALLE Auth Cookies löschen
    response.cookies.set("userId", "", { maxAge: 0 });
    response.cookies.set("role", "", { maxAge: 0 });

    return response;
  } catch (error) {
    console.error("LOGOUT ERROR:", error);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}