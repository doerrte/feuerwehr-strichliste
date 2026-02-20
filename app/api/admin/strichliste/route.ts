import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function requireAdmin() {
  const cookieStore = cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") return null;

  return Number(userId);
}

export async function GET(req: Request) {
  const adminId = await requireAdmin();

  if (!adminId) {
    return NextResponse.json(
      { error: "Nicht erlaubt" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const selectedUserId = Number(searchParams.get("userId"));

  if (!selectedUserId) {
    return NextResponse.json([]);
  }

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
  const adminId = await requireAdmin();

  if (!adminId) {
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