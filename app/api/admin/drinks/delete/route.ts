import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { drinkId } = await req.json();

  await prisma.count.deleteMany({
    where: { drinkId },
  });

  await prisma.drink.delete({
    where: { id: drinkId },
  });

  return NextResponse.json({ success: true });
}
