import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPin } from "@/lib/hash";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const userId = cookies().get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Nicht eingeloggt" },
        { status: 401 }
      );
    }

    // 🔐 Echten User laden
    const currentUser = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { name, phone, pin } = await req.json();

    if (!name || !phone || !pin) {
      return NextResponse.json(
        { error: "Fehlende Daten" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPin(pin);

    await prisma.user.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        passwordHash,
        role: "USER",
        active: true,
      },
    });

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error("CREATE USER ERROR:", error);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}
