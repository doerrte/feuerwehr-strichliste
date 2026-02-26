import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { phone, pin } = await req.json();

if (!phone || !pin) {
  return NextResponse.json(
    { error: "Fehlende Daten" },
    { status: 400 }
  );
}

    // 🔥 Telefonnummer bereinigen
     const { phone, pin } = await req.json();

      if (!phone || !pin) {
        return NextResponse.json(
          { error: "Fehlende Daten" },
          { status: 400 }
        );
      }

      // 🔥 Telefonnummer bereinigen
      const cleanedPhone = phone.replace(/\D/g, "");

      const user = await prisma.user.findUnique({
        where: { phone: cleanedPhone },
      });

    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user || !user.active) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
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

    const response = NextResponse.json({
      success: true,
      redirect: "/dashboard",
    });

    response.cookies.set("userId", String(user.id), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
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