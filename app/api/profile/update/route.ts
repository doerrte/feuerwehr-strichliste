import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { hashPin } from "@/lib/hash";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const userId = cookies().get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Nicht eingeloggt" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!user || !user.active) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
      );
    }

    const { phone, oldPassword, newPassword } =
      await req.json();

    const updateData: any = {};

    // 📱 Telefonnummer validieren
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

    // 🔢 PIN ändern
    if (newPassword) {
      // Alte PIN prüfen
      if (!oldPassword) {
        return NextResponse.json(
          { error: "Alte PIN erforderlich" },
          { status: 400 }
        );
      }

      const validOld = await bcrypt.compare(
        oldPassword,
        user.passwordHash
      );

      if (!validOld) {
        return NextResponse.json(
          { error: "Alte PIN falsch" },
          { status: 401 }
        );
      }

      // Neue PIN prüfen
      if (!/^\d{4}$/.test(newPassword)) {
        return NextResponse.json(
          { error: "PIN muss genau 4 Zahlen enthalten" },
          { status: 400 }
        );
      }

      const weakPins = ["0000", "1111", "1234"];

      if (weakPins.includes(newPassword)) {
        return NextResponse.json(
          { error: "Unsichere PIN wählen" },
          { status: 400 }
        );
      }

      const newHash = await hashPin(newPassword);
      updateData.passwordHash = newHash;
    }

    await prisma.user.update({
      where: { id: Number(userId) },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error("PROFILE UPDATE ERROR:", error);

    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}