import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = Number(cookies().get("userId")?.value);

  if (!userId) {
    return NextResponse.json([], { status: 401 });
  }

  const drinks = await prisma.drink.findMany({
    orderBy: { name: "asc" },
    include: {
      counts: {
        where: {
          userId: userId,
        },
      },
    },
  });

  const result = drinks.map((drink) => {
    const unitsPerCase = drink.bottlesPerCrate ?? 0;

    const stock =
      (drink.crates ?? 0) * unitsPerCase +
      (drink.bottles ?? 0);

    return {
      id: drink.id,
      name: drink.name,
      amount: drink.counts[0]?.amount ?? 0,
      stock,
      unitsPerCase,
    };
  });

  return NextResponse.json(result);
}