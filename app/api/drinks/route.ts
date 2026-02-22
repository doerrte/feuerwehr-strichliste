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
  try {
    const drinks = await prisma.drink.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        stock: true,
        unitsPerCase: true,
        minStock: true,
      },
    });

    return NextResponse.json(drinks);
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Laden der Getränke" },
      { status: 500 }
    );
  }
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

  const {
    name,
    unitsPerCase,
    cases,
    singleBottles,
    minStock,
  } = await req.json();

  const totalStock =
    Number(unitsPerCase) * Number(cases) +
    Number(singleBottles);

  const drink = await prisma.drink.create({
    data: {
      name,
      unitsPerCase: Number(unitsPerCase),
      stock: totalStock,
      minStock: Number(minStock) || 10,
    },
  });

  return NextResponse.json(drink);
}