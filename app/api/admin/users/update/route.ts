import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { hashPin } from "@/lib/hash";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    const { userId, name, phone, pin, role, active } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Benutzer-ID fehlt" },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (name) {
      updateData.name = name.trim();
    }

    if (phone) {
      updateData.phone = phone.replace(/\D/g, "");
    }

    if (pin) {
      if (!/^\d{4}$/.test(pin)) {
        return NextResponse.json(
          { error: "PIN muss 4 Zahlen enthalten" },
          { status: 400 }
        );
      }

      updateData.passwordHash = await hashPin(pin);
    }

    if (role === "USER" || role === "ADMIN") {
      updateData.role = role;
    }

    if (typeof active === "boolean") {
      updateData.active = active;
    }

    await prisma.user.update({
      where: { id: Number(userId) },
      data: updateData,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("UPDATE USER ERROR:", error);

    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}