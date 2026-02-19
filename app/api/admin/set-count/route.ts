import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
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

  await prisma.count.upsert({
    where: {
      userId_drinkId: {
        userId,
        drinkId,
      },
    },
    update: { amount },
    create: {
      userId,
      drinkId,
      amount,
    },
  });

  return NextResponse.json({ success: true });
}
