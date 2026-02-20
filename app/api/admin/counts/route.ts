import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function requireAdmin() {
  const userIdCookie = cookies().get("userId")?.value;
  if (!userIdCookie) return null;

  const user = await prisma.user.findUnique({
    where: { id: Number(userIdCookie) },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") return null;

  return Number(userIdCookie);
}

/* =========================
   GET – Counts eines Users
========================= */
export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get("userId"));

  if (!userId) {
    return NextResponse.json(
      { error: "userId fehlt" },
      { status: 400 }
    );
  }

  const counts = await prisma.count.findMany({
    where: { userId },
    select: {
      drinkId: true,
      amount: true,
    },
  });

  return NextResponse.json(counts);
}

/* =========================
   POST – Count updaten
========================= */
export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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