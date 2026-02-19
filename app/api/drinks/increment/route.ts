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

    const { drinkId, amount } = await req.json();

    if (!drinkId || !amount) {
      return NextResponse.json(
        { error: "Ungültige Daten" },
        { status: 400 }
      );
    }

    // 🔥 Prüfen ob genug Bestand da ist
    const drink = await prisma.drink.findUnique({
      where: { id: drinkId },
    });

    if (!drink || drink.stock < amount) {
      return NextResponse.json(
        { error: "Nicht genug Bestand" },
        { status: 400 }
      );
    }

    // 🔥 Transaktion: Count erhöhen + Stock verringern
    await prisma.count.upsert({
  where: {
    userId_drinkId: {
      userId,
      drinkId,
    },
  },
  update: {
    amount: {
      increment: amount,
    },
  },
  create: {
    userId,
    drinkId,
    amount,
  },
});

// 🔥 Bestand im Lager reduzieren
await prisma.drink.update({
  where: { id: drinkId },
  data: {
    stock: {
      decrement: amount,
    },
  },
});


    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("INCREMENT ERROR:", error);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}
