import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function requireAdmin() {
  const userId = Number(cookies().get("userId")?.value);
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.role !== "ADMIN") return null;

  return user;
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, drinkId, amount } = await req.json();

  if (!userId || !drinkId || amount === undefined) {
    return NextResponse.json(
      { error: "Ungültige Daten" },
      { status: 400 }
    );
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
