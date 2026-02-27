import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userIdRaw = cookies().get("userId")?.value;

    if (!userIdRaw) {
      return NextResponse.json(
        { error: "Nicht eingeloggt" },
        { status: 401 }
      );
    }

    const userId = Number(userIdRaw);

    const drinks = await prisma.drink.findMany({
      orderBy: { name: "asc" },
      include: {
        counts: {
          where: { userId },
        },
      },
    });

    const result = drinks.map((drink) => ({
      id: drink.id,
      name: drink.name,
      stock: drink.stock,
      unitsPerCase: drink.unitsPerCase,
      minStock: drink.minStock,
      amount: drink.counts[0]?.amount ?? 0,
    }));

    return NextResponse.json(result);

  } catch (error) {
    console.error("DRINKS ME ERROR:", error);

    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}