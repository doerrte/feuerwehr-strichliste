import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const userId = Number(cookies().get("userId")?.value);
  if (!userId) {
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }

  const counts = await prisma.count.findMany({
    where: { userId },
    include: { drink: true },
  });

  return NextResponse.json(counts);
}

export async function POST(req: Request) {
  const userId = Number(cookies().get("userId")?.value);
  if (!userId) {
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }

  const { drinkId, amount } = await req.json();

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
