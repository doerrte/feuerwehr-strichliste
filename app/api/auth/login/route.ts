import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

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
        { error: "Benutzer nicht erlaubt" },
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
      id: user.id,
      name: user.name,
      role: user.role,
    });

    response.cookies.set("userId", String(user.id), {
      httpOnly: true,
      path: "/",
    });

    response.cookies.set("role", user.role, {
      httpOnly: true,
      path: "/",
    });

    return response;

  } catch (error) {
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}