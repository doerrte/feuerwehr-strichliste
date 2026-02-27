import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { LogType } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const sessionUserId = Number(cookies().get("userId")?.value);

    if (!sessionUserId) {
      return NextResponse.json(
        { error: "Nicht eingeloggt" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const parsedDrinkId = Number(body.drinkId);
    const parsedAmount = Number(body.amount);

    if (
      !parsedDrinkId ||
      isNaN(parsedAmount) ||
      parsedAmount <= 0
    ) {
      return NextResponse.json(
        { error: "Ungültige Daten" },
        { status: 400 }
      );
    }

    // 🔥 User prüfen
    const user = await prisma.user.findUnique({
      where: { id: sessionUserId },
      select: { id: true, active: true },
    });

    if (!user || !user.active) {
      return NextResponse.json(
        { error: "User nicht aktiv" },
        { status: 403 }
      );
    }

    // 🔥 Transaktion (atomic)
    await prisma.$transaction(async (tx) => {

      const existingCount = await tx.count.findUnique({
        where: {
          userId_drinkId: {
            userId: sessionUserId,
            drinkId: parsedDrinkId,
          },
        },
      });

      const oldAmount = existingCount?.amount ?? 0;
      const newAmount = oldAmount + parsedAmount;

      if (!existingCount) {
        await tx.count.create({
          data: {
            userId: sessionUserId,
            drinkId: parsedDrinkId,
            amount: newAmount,
          },
        });
      } else {
        await tx.count.update({
          where: {
            userId_drinkId: {
              userId: sessionUserId,
              drinkId: parsedDrinkId,
            },
          },
          data: {
            amount: newAmount,
          },
        });
      }

      // 🔥 Log speichern
      await tx.countLog.create({
        data: {
          adminId: sessionUserId,
          userId: sessionUserId,
          drinkId: parsedDrinkId,
          oldAmount,
          newAmount,
          type: LogType.MANUAL,
        },
      });

    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("SCAN ERROR:", error);

    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}