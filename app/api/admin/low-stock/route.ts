import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = cookies().get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ low: false });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ low: false });
    }

    const lowStock = await prisma.drink.findFirst({
      where: {
        stock: {
          lte: prisma.drink.fields.minStock,
        },
      },
    });

    return NextResponse.json({
      low: !!lowStock,
    });

  } catch (error) {
    console.error("LOW STOCK ERROR:", error);
    return NextResponse.json({ low: false });
  }
}