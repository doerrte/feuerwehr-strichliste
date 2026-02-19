import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const userId = Number(cookies().get("userId")?.value);

  if (!userId) {
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }

  const { drinkId, amount } = await req.json();

  if (!drinkId || !amount) {
    return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });
  }

  const existing = await prisma.count.findUnique({
    where: {
      userId_drinkId: {
        userId,
        drinkId,
      },
    },
  });

  if (existing) {
    await prisma.count.update({
      where: {
        userId_drinkId: {
          userId,
          drinkId,
        },
      },
      data: {
        amount: existing.amount + amount,
      },
    });
  } else {
    await prisma.count.create({
      data: {
        userId,
        drinkId,
        amount,
      },
    });
  }

  return NextResponse.json({ success: true });
}
