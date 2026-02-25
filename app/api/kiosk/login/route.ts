import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId, pin } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!user || !user.active) {
      return NextResponse.json(
        { error: "Ungültiger Benutzer" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(pin, user.passwordHash);

    if (!valid) {
      return NextResponse.json(
        { error: "Falsche PIN" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set("userId", String(user.id), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });

    response.cookies.set("mode", "kiosk", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
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