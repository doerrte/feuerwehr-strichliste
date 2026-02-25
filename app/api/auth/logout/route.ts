import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const cookieStore = cookies();

    // 🔎 Prüfen ob Kiosk-Mode aktiv war
    const mode = cookieStore.get("mode")?.value;

    // 🧹 Cookies löschen
    cookieStore.delete("userId");
    cookieStore.delete("mode");

    // 🎯 Redirect-Ziel bestimmen
    const redirectTo = mode === "kiosk" ? "/kiosk" : "/login";

    return NextResponse.json({
      success: true,
      redirect: redirectTo,
    });

  } catch (error) {
    console.error("LOGOUT ERROR:", error);

    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}