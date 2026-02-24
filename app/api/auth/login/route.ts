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

    if (!user || !user.active) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden oder deaktiviert" },
        { status: 403 }
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
      redirect: user.hasSeenIntro ? "/dashboard" : "/intro",
    });

    response.cookies.set("userId", String(user.id), {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: true,
    });

    return response;

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}