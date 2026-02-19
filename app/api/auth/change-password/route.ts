import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const cookieUserId = cookies().get("userId")?.value;

    if (!cookieUserId) {
      return NextResponse.json(
        { error: "Nicht eingeloggt" },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Daten fehlen" },
        { status: 400 }
      );
    }

    if (newPassword.length < 4) {
      return NextResponse.json(
        { error: "Passwort zu kurz" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(cookieUserId) },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User nicht gefunden" },
        { status: 404 }
      );
    }

    const valid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!valid) {
      return NextResponse.json(
        { error: "Aktuelles Passwort falsch" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashed,
      },
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}
