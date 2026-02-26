import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const userId = Number(body.userId);
    const pin = String(body.password || "");

    if (!userId || !pin) {
      return NextResponse.json(
        { error: "Ungültige Daten" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.active) {
      return NextResponse.json(
        { error: "Benutzer ungültig" },
        { status: 401 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Kein Passwort gesetzt" },
        { status: 500 }
      );
    }

    const valid = await bcrypt.compare(pin, user.passwordHash);

    if (!valid) {
      return NextResponse.json(
        { error: "Falscher PIN" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set("userId", String(user.id), {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
    });

    response.cookies.set("mode", "kiosk", {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
    });

    return response;

  } catch (error) {
    console.error("KIOSK LOGIN ERROR:", error);

    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}