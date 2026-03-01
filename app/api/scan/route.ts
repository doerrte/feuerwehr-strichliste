import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { LogType } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const userIdRaw = cookies().get("userId")?.value;

    if (!userIdRaw) {
      return NextResponse.json(
        { error: "Nicht eingeloggt" },
        { status: 401 }
      );
    }

    const userId = Number(userIdRaw);
    const { drinkId, quantity } = await req.json();

    if (!drinkId) {
      return NextResponse.json(
        { error: "DrinkId fehlt" },
        { status: 400 }
      );
    }

    const amountToAdd = quantity ? Number(quantity) : 1;

    // 🔥 1. Bestand prüfen
    const drink = await prisma.drink.findUnique({
      where: { id: drinkId },
    });

    if (!drink) {
      return NextResponse.json(
        { error: "Getränk nicht gefunden" },
        { status: 404 }
      );
    }

    if (drink.stock < amountToAdd) {
      return NextResponse.json(
        { error: "Nicht genug Bestand" },
        { status: 400 }
      );
    }

    // 🔥 2. Count erhöhen
    const updatedCount = await prisma.count.upsert({
      where: {
        userId_drinkId: {
          userId,
          drinkId,
        },
      },
      update: {
        amount: {
          increment: amountToAdd,
        },
      },
      create: {
        userId,
        drinkId,
        amount: amountToAdd,
      },
    });

    // 🔥 3. Lager reduzieren
    await prisma.drink.update({
      where: { id: drinkId },
      data: {
        stock: {
          decrement: amountToAdd,
        },
      },
    });

    // 🔥 4. Log speichern
    await prisma.countLog.create({
      data: {
        adminId: userId,
        userId,
        drinkId,
        oldAmount: updatedCount.amount - amountToAdd,
        newAmount: updatedCount.amount,
        type: LogType.MANUAL,
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