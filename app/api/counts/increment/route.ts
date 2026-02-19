import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const auth = cookies().get("auth");
  if (!auth) {
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }

  const { userId } = JSON.parse(auth.value);
  const { drinkId } = await req.json();

  // Eintrag finden oder neu anlegen
  const existing = await prisma.count.findFirst({
    where: {
      userId,
      drinkId,
    },
  });

  if (existing) {
    await prisma.count.update({
      where: { id: existing.id },
      data: { count: { increment: 1 } },
    });
  } else {
    await prisma.count.create({
      data: {
        userId,
        drinkId,
        count: 1,
      },
    });
  }

  // Neue Übersicht zurückgeben
  const counts = await prisma.count.findMany({
    where: { userId },
    include: { drink: true },
    orderBy: { drink: { name: "asc" } },
  });

  return NextResponse.json(counts);
}
