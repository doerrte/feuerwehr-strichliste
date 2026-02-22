import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const userId = Number(cookies().get("userId")?.value);

    if (!userId) {
      return NextResponse.json(
        { error: "Nicht eingeloggt" },
        { status: 401 }
      );
    }

    const { drinkId } = await req.json();

    if (!drinkId) {
      return NextResponse.json(
        { error: "Kein Getränk angegeben" },
        { status: 400 }
      );
    }

    const drink = await prisma.drink.findUnique({
      where: { id: Number(drinkId) },
    });

    if (!drink) {
      return NextResponse.json(
        { error: "Getränk nicht verfügbar" },
        { status: 404 }
      );
    }

    if (drink.stock <= 0) {
      return NextResponse.json(
        { error: "Kein Lagerbestand mehr" },
        { status: 400 }
      );
    }

    await prisma.drink.update({
      where: { id: drink.id },
      data: {
        stock: { decrement: 1 },
      },
    });

    await prisma.count.upsert({
      where: {
        userId_drinkId: {
          userId,
          drinkId: drink.id,
        },
      },
      update: {
        amount: { increment: 1 },
      },
      create: {
        userId,
        drinkId: drink.id,
        amount: 1,
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("SCAN ERROR:", error);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}