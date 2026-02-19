import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const adminId = Number(cookies().get("userId")?.value);
  if (!adminId) {
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }

  const admin = await prisma.user.findUnique({
    where: { id: adminId },
  });

  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const userId = Number(req.nextUrl.searchParams.get("userId"));
  if (!userId) {
    return NextResponse.json({ error: "userId fehlt" }, { status: 400 });
  }

  const drinks = await prisma.drink.findMany({
    include: {
      counts: {
        where: { userId },
      },
    },
    orderBy: { name: "asc" },
  });

  const result = drinks.map((drink) => ({
    id: drink.id,
    name: drink.name,
    amount: drink.counts[0]?.amount ?? 0,
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const adminId = Number(cookies().get("userId")?.value);
  if (!adminId) {
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }

  const admin = await prisma.user.findUnique({
    where: { id: adminId },
  });

  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { userId, drinkId, amount } = await req.json();

  if (!userId || !drinkId || amount === undefined) {
    return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });
  }

  await prisma.count.upsert({
    where: {
      userId_drinkId: {
        userId,
        drinkId,
      },
    },
    update: {
      amount,
    },
    create: {
      userId,
      drinkId,
      amount,
    },
  });

  return NextResponse.json({ success: true });
}
