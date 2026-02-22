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

/* =========================
   GET – Alle Getränke
========================= */
export async function GET() {
  const drinks = await prisma.drink.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json(drinks);
}

/* =========================
   POST – Neues Getränk
========================= */
export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { error: "Nicht erlaubt" },
      { status: 403 }
    );
  }

  const { name, stock, unitsPerCase } =
    await req.json();

  const drink = await prisma.drink.create({
    data: {
      name,
      stock: Number(stock),
      unitsPerCase: Number(unitsPerCase),
    },
  });

  return NextResponse.json(drink);
}