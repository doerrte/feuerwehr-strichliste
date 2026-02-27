import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const userId = Number(cookies().get("userId")?.value);

  if (!userId) {
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }

  const drinks = await prisma.drink.findMany({
    include: {
      counts: {
        where: { userId },
      },
    },
  });

  const result = drinks.map((d) => ({
    id: d.id,
    name: d.name,
    amount: d.counts[0]?.amount ?? 0,
  }));

  return NextResponse.json(result);
}
