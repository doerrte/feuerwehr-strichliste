import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPin } from "@/lib/hash";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const adminId = cookies().get("userId")?.value;

    if (!adminId) {
      return NextResponse.json(
        { error: "Nicht eingeloggt" },
        { status: 401 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: { id: Number(adminId) },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Keine Berechtigung" },
        { status: 403 }
      );
    }

    const { name, phone, pin, role } = await req.json();

    if (!name || !phone || !pin) {
      return NextResponse.json(
        { error: "Fehlende Daten" },
        { status: 400 }
      );
    }

    const cleanedPhone = phone.replace(/\D/g, "");

    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: "PIN muss 4 Zahlen enthalten" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPin(pin);

    await prisma.user.create({
      data: {
        name: name.trim(),
        phone: cleanedPhone,
        passwordHash,
        role: role === "ADMIN" ? "ADMIN" : "USER",
        active: true,
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("CREATE USER ERROR:", error);

    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}