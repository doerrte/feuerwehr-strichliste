import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    if (!cookies().get("userId")?.value) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { drinkId, stock } = await req.json();

    await prisma.drink.update({
      where: { id: Number(drinkId) },
      data: {
        stock: Number(stock),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("UPDATE STOCK ERROR:", error);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
