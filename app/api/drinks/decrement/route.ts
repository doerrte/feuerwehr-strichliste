import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const userId = cookies().get("userId")?.value;
    if (!userId) {
      return NextResponse.json(
        { error: "Nicht eingeloggt" },
        { status: 401 }
      );
    }

    const { drinkId } = await req.json();

    if (!drinkId) {
      return NextResponse.json(
        { error: "drinkId fehlt" },
        { status: 400 }
      );
    }

    const existing = await prisma.count.findUnique({
      where: {
        userId_drinkId: {
          userId: Number(userId),
          drinkId: Number(drinkId),
        },
      },
    });

    // 👉 Noch kein Eintrag oder bereits 0 → nichts tun
    if (!existing || existing.amount <= 0) {
      return NextResponse.json({ ok: true });
    }

    await prisma.count.update({
      where: {
        userId_drinkId: {
          userId: Number(userId),
          drinkId: Number(drinkId),
        },
      },
      data: {
        amount: {
          decrement: 1,
        },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DECREMENT ERROR", error);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}
