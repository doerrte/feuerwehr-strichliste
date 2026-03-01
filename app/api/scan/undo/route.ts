import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { LogType } from "@prisma/client";

export const dynamic = "force-dynamic";

// 🔎 Letzte Buchung abrufen (nur anzeigen)
export async function GET() {
  const userIdRaw = cookies().get("userId")?.value;
  if (!userIdRaw)
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });

  const userId = Number(userIdRaw);

  const lastLog = await prisma.countLog.findFirst({
    where: {
      userId,
      type: LogType.MANUAL,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      drink: true,
    },
  });

  if (!lastLog)
    return NextResponse.json({ error: "Keine Buchung gefunden" }, { status: 404 });

  const quantity = lastLog.newAmount - lastLog.oldAmount;

  return NextResponse.json({
    drinkId: lastLog.drinkId,
    drinkName: lastLog.drink.name,
    quantity,
    createdAt: lastLog.createdAt,
  });
}

// 🔥 Wirklich rückgängig machen
export async function POST() {
  const userIdRaw = cookies().get("userId")?.value;
  if (!userIdRaw)
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });

  const userId = Number(userIdRaw);

  const lastLog = await prisma.countLog.findFirst({
    where: {
      userId,
      type: LogType.MANUAL,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!lastLog)
    return NextResponse.json({ error: "Keine Buchung gefunden" }, { status: 404 });

  const quantity = lastLog.newAmount - lastLog.oldAmount;

  await prisma.$transaction([
    prisma.count.update({
      where: {
        userId_drinkId: {
          userId,
          drinkId: lastLog.drinkId,
        },
      },
      data: {
        amount: {
          decrement: quantity,
        },
      },
    }),

    prisma.drink.update({
      where: { id: lastLog.drinkId },
      data: {
        stock: {
          increment: quantity,
        },
      },
    }),

    prisma.countLog.delete({
      where: { id: lastLog.id },
    }),
  ]);

  return NextResponse.json({ success: true });
}