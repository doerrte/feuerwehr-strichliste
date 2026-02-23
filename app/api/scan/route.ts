import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const userIdRaw = cookieStore.get("userId")?.value;

    if (!userIdRaw) {
      return NextResponse.json(
        { error: "Nicht eingeloggt" },
        { status: 401 }
      );
    }

    const userId = Number(userIdRaw);

    const { drinkId, amount } = await req.json();

    const drink = await prisma.drink.findUnique({
      where: { id: drinkId },
    });

    if (!drink) {
      return NextResponse.json(
        { error: "Getränk nicht gefunden" },
        { status: 404 }
      );
    }

    const bookingAmount = Number(amount);

    if (!bookingAmount || bookingAmount <= 0) {
      return NextResponse.json(
        { error: "Ungültige Menge" },
        { status: 400 }
      );
    }

    if (drink.stock < bookingAmount) {
      return NextResponse.json(
        { error: "Nicht genügend Bestand" },
        { status: 400 }
      );
    }

    await prisma.$transaction([

      prisma.count.upsert({
        where: {
          userId_drinkId: {
            userId,
            drinkId,
          },
        },
        update: {
          amount: {
            increment: bookingAmount,
          },
        },
        create: {
          userId,
          drinkId,
          amount: bookingAmount,
        },
      }),

      prisma.drink.update({
        where: { id: drinkId },
        data: {
          stock: {
            decrement: bookingAmount,
          },
        },
      }),

    ]);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("SCAN ERROR:", error);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}