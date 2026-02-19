import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const userId = cookies().get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Nicht eingeloggt" },
        { status: 401 }
      );
    }

    const drinks = await prisma.drink.findMany({
      include: {
        counts: {
          where: { userId: Number(userId) },
        },
      },
      orderBy: { name: "asc" },
    });

    const result = drinks.map((d) => ({
      id: d.id,
      name: d.name,
      amount: d.counts[0]?.amount ?? 0, // getrunken
      stock: d.stock,                  // Lagerbestand
      unitsPerCase: d.unitsPerCase,
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
