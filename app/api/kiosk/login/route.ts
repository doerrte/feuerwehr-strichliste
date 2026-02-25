import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId, password } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!user || !user.active) {
      return NextResponse.json(
        { error: "Ungültig" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!valid) {
      return NextResponse.json(
        { error: "Falsches Passwort" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
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