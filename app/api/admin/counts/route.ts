import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const userId = Number(cookies().get("userId")?.value);
  if (!userId) return false;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return user?.role === "ADMIN";
}

export async function GET(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { error: "Nicht erlaubt" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const userId = Number(
    searchParams.get("userId")
  );

  const counts = await prisma.count.findMany({
    where: { userId },
    select: {
      drinkId: true,
      amount: true,
    },
  });

  return NextResponse.json(counts);
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { error: "Nicht erlaubt" },
      { status: 403 }
    );
  }

  const { userId, drinkId, amount } =
    await req.json();

  const result =
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

  return NextResponse.json(result);
}