import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

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

    // 🔥 Letzten Log dieses Users finden (egal welcher Typ)
    const lastLog = await prisma.countLog.findFirst({
      where: {
        userId,
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

    // 🔥 Zähler zurücksetzen
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
        type: "SYSTEM",
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