import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
      where: { phone },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
      );
    }

    // 🔒 Gelöscht?
    if (user.deletedAt) {
      return NextResponse.json(
        { error: "Benutzer wurde gelöscht" },
        { status: 403 }
      );
    }

    // 🔒 Deaktiviert?
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

    const response = NextResponse.json({
      success: true,
      role: user.role,
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