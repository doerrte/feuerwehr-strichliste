import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = Number(cookies().get("userId")?.value);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const drinks = await prisma.drink.findMany({
      orderBy: { name: "asc" },
      include: {
        counts: {
          where: { userId },
        },
      },
    });

    const result = drinks.map((drink) => {
      const amount = drink.counts[0]?.amount ?? 0;

      return {
        id: drink.id,
        name: drink.name,
        amount,
        stock: drink.stock ?? 0,
        unitsPerCase: drink.unitsPerCase ?? 1,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("DRINKS ME ERROR:", error);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}