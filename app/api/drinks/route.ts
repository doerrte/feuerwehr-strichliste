import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function requireAdmin() {
  const userId = Number(cookies().get("userId")?.value);
  if (!userId) return false;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.role !== "ADMIN") return false;

  return true;
}

/* =====================
   GET – Alle Getränke
===================== */
export async function GET() {
  const drinks = await prisma.drink.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json(drinks);
}

/* =====================
   POST – Neues Getränk
===================== */
export async function POST(req: Request) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) {
    return NextResponse.json(
      { error: "Nicht erlaubt" },
      { status: 403 }
    );
  }

  const { name, cases, unitsPerCase, extraBottles } =
    await req.json();

  const totalStock =
    cases * unitsPerCase + extraBottles;

  const drink = await prisma.drink.create({
    data: {
      name,
      stock: totalStock,
      unitsPerCase,
    },
  });

  return NextResponse.json(drink);
}