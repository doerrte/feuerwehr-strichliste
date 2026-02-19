import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { drinkId, stock } = await req.json();

  await prisma.drink.update({
    where: { id: drinkId },
    data: { stock: Number(stock) },
  });

  return NextResponse.json({ success: true });
}
