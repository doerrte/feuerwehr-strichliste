import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { hashPin } from "@/lib/hash";

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, name, phone, pin, role } = await req.json();

    if (!id || !name || !phone) {
      return NextResponse.json({ error: "Fehlende Daten" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { phone },
    });

    if (existing && existing.id !== id) {
      return NextResponse.json(
        { error: "Telefonnummer bereits vergeben" },
        { status: 400 }
      );
    }

    const updateData: any = {
      name: name.trim(),
      phone: phone.trim(),
      role,
    };

    if (pin && pin.length > 0) {
      updateData.passwordHash = await hashPin(pin);
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error("UPDATE USER ERROR:", error);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}