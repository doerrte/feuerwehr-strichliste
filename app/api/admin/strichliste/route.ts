import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const userId = cookies().get("userId")?.value;
  const role = cookies().get("role")?.value;

  if (!userId || role !== "ADMIN") {
    return NextResponse.json(
      { error: "Nicht erlaubt" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const selectedUserId = Number(searchParams.get("userId"));

  const drinks = await prisma.drink.findMany({
    orderBy: { name: "asc" },
    include: {
      counts: {
        where: {
          userId: selectedUserId,
        },
      },
    },
  });

  const result = drinks.map((d) => ({
    id: d.id,
    name: d.name,
    amount: d.counts[0]?.amount ?? 0,
  }));

  return NextResponse.json(result);
}

export async function PUT(req: Request) {
  const userId = cookies().get("userId")?.value;
  const role = cookies().get("role")?.value;

  if (!userId || role !== "ADMIN") {
    return NextResponse.json(
      { error: "Nicht erlaubt" },
      { status: 403 }
    );
  }

  const { userId: targetUserId, drinkId, amount } =
    await req.json();

  await prisma.count.upsert({
    where: {
      userId_drinkId: {
        userId: targetUserId,
        drinkId,
      },
    },
    update: { amount },
    create: {
      userId: targetUserId,
      drinkId,
      amount,
    },
  });

  return NextResponse.json({ success: true });
}
