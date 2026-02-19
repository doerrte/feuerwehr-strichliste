import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const adminId = cookies().get("userId")?.value;

  if (!adminId) {
    return NextResponse.json(
      { error: "Nicht eingeloggt" },
      { status: 401 }
    );
  }

  const admin = await prisma.user.findUnique({
    where: { id: Number(adminId) },
  });

  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Keine Berechtigung" },
      { status: 403 }
    );
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
        userId: Number(userId),
        drinkId: Number(drinkId),
      },
    },
    update: {
      amount: Number(amount),
    },
    create: {
      userId: Number(userId),
      drinkId: Number(drinkId),
      amount: Number(amount),
    },
  });

  return NextResponse.json({ success: true });
}
