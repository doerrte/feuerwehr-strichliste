import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
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
      where: { phone },   // ✅ Richtig!
    });

    if (!user) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 401 }
      );
    }

    if (!user.active) {
      return NextResponse.json(
        { error: "Benutzer ist deaktiviert" },
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

    const cookieStore = cookies();

    cookieStore.set("userId", String(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    // 🔥 Intro Weiterleitung
    if (!user.hasSeenIntro) {
      return NextResponse.json({
        redirect: "/intro",
      });
    }

    return NextResponse.json({
      redirect: "/dashboard",
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}