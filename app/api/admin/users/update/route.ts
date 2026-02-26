import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { hashPin } from "@/lib/hash";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const adminId = cookieStore.get("userId")?.value;

    if (!adminId) {
      return NextResponse.json(
        { error: "Nicht eingeloggt" },
        { status: 401 }
      );
    }

    // 🔐 Admin prüfen
    const admin = await prisma.user.findUnique({
      where: { id: Number(adminId) },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Keine Berechtigung" },
        { status: 403 }
      );
    }

    const {
      userId,
      name,
      phone,
      pin,
      role,
      active,
    } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Benutzer-ID fehlt" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
      );
    }

    const updateData: any = {};

    // 📝 Name optional
    if (name) {
      updateData.name = name.trim();
    }

    // 📱 Telefonnummer nur Zahlen
    if (phone) {
      const cleanedPhone = phone.replace(/\D/g, "");

      if (!/^\d+$/.test(cleanedPhone)) {
        return NextResponse.json(
          { error: "Telefonnummer darf nur Zahlen enthalten" },
          { status: 400 }
        );
      }

      updateData.phone = cleanedPhone;
    }

    // 🔢 PIN nur wenn gesetzt
    if (pin) {
      if (!/^\d{4}$/.test(pin)) {
        return NextResponse.json(
          { error: "PIN muss genau 4 Zahlen enthalten" },
          { status: 400 }
        );
      }

      const passwordHash = await hashPin(pin);
      updateData.passwordHash = passwordHash;
    }

    // 👤 Rolle ändern
    if (role && (role === "USER" || role === "ADMIN")) {
      updateData.role = role;
    }

    // 🚫 Aktiv / Deaktivieren
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