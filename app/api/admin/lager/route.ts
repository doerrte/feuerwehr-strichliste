import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

function isAdmin() {
  return !!cookies().get("userId")?.value;
}

export async function GET() {
  if (!isAdmin()) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const drinks = await prisma.drink.findMany({
    include: {
      counts: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const result = drinks.map((d) => ({
    id: d.id,
    name: d.name,
    stock: d.stock,
    unitsPerCase: d.unitsPerCase,
    totalConsumed: d.counts.reduce(
      (sum, c) => sum + c.amount,
      0
    ),
  }));

  return NextResponse.json(result);
}
