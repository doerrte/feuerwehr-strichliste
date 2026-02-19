import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

function isAdmin() {
  const userId = cookies().get("userId")?.value;
  return !!userId; // Middleware schützt Admin
}

export async function POST(req: Request) {
  try {
    if (!isAdmin()) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { userId, newPassword } = await req.json();

    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: "userId oder newPassword fehlt" },
        { status: 400 }
      );
    }

    if (newPassword.length < 4) {
      return NextResponse.json(
        { error: "Passwort zu kurz" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        passwordHash: hashed,
      },
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("PASSWORD CHANGE ERROR:", err);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}
