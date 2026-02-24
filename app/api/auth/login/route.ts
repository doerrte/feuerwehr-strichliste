import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { phone, password } = await req.json();

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Fehlende Daten" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
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

    response.cookies.set("userId", String(user.id), {
      httpOnly: true,
      secure: true,          // 🔥 WICHTIG für PWA
      sameSite: "lax",
      path: "/",
    });

    return response;

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}