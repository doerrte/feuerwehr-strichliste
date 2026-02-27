import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { LogType } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const userId = Number(cookies().get("userId")?.value);

    if (!userId) {
      return NextResponse.json(
        { error: "Nicht eingeloggt" },
        { status: 401 }
      );
    }

    // 🔥 Letzte manuelle Buchung dieses Users finden
    const lastLog = await prisma.countLog.findFirst({
      where: {
        userId,
        type: LogType.MANUAL,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!lastLog) {
      return NextResponse.json(
        { error: "Keine Buchung gefunden" },
        { status: 400 }
      );
    }

    // 🔥 Count zurücksetzen
    await prisma.count.update({
      where: {
        userId_drinkId: {
          userId,
          drinkId: lastLog.drinkId,
        },
      },
      data: {
        amount: lastLog.oldAmount,
      },
    });

    // 🔥 Undo Log erstellen
    await prisma.countLog.create({
      data: {
        adminId: userId,
        userId,
        drinkId: lastLog.drinkId,
        oldAmount: lastLog.newAmount,
        newAmount: lastLog.oldAmount,
        type: LogType.SYSTEM, // 🔥 Undo als System-Eintrag markieren
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("UNDO ERROR:", error);

    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}