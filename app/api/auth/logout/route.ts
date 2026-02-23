import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    cookies().delete("userId");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}