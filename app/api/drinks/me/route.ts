import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = cookies();
  const userId = Number(cookieStore.get("userId")?.value);

  if (!userId) {
    return NextResponse.json([], { status: 401 });
  }

  const drinks = await prisma.drink.findMany({
    orderBy: { name: "asc" },
    include: {
      counts: {
        where: {
          userId: userId
        }
      }
    }
  });

  const result = drinks.map(drink => ({
    id: drink.id,
    name: drink.name,
    amount: drink.counts[0]?.amount ?? 0
  }));

  return NextResponse.json(result);
}