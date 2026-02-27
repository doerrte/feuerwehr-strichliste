import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userIdRaw = cookies().get("userId")?.value;

    if (!userIdRaw) {
      return NextResponse.json(
        { error: "Nicht eingeloggt" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(userIdRaw) },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Keine Berechtigung" },
        { status: 403 }
      );
    }

    const drinks = await prisma.drink.findMany({
      orderBy: { name: "asc" },
      include: {
        counts: true,
      },
    });

    const result = drinks.map((drink) => ({
      id: drink.id,
      name: drink.name,
      stock: drink.stock,
      minStock: drink.minStock,
      unitsPerCase: drink.unitsPerCase,
      totalConsumed: drink.counts.reduce(
        (sum, count) => sum + count.amount,
        0
      ),
    }));

    return NextResponse.json(result);

  } catch (error) {
    console.error("ADMIN DRINKS ME ERROR:", error);

    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}