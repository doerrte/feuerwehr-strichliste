import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const sessionUserId = Number(cookies().get("userId")?.value);

    if (!sessionUserId) {
      return NextResponse.json(
        { error: "Nicht eingeloggt" },
        { status: 401 }
      );
    }

    // 🔥 Letzten Log dieses eingeloggten Users finden
    const lastLog = await prisma.countLog.findFirst({
      where: {
        OR: [
          { userId: sessionUserId },
          { adminId: sessionUserId },
        ],
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

    console.log("LastLog", lastLog);
    
    // 🔥 WICHTIG: betroffener User aus Log
    const affectedUserId = lastLog.userId;

    // 🔥 Count sauber updaten
    await prisma.count.update({
      where: {
        userId_drinkId: {
          userId: affectedUserId,
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
        adminId: sessionUserId,
        userId: affectedUserId,
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