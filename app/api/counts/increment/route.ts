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

    if (existing) {
      await prisma.count.update({
        where: { id: existing.id },
        data: {
          amount: { increment: 1 }, // ✅ RICHTIG
        },
      });
    } else {
      await prisma.count.create({
        data: {
          userId: Number(userId),
          drinkId: Number(drinkId),
          amount: 1, // ✅ RICHTIG
        },
      });
    }

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("INCREMENT ERROR:", err);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}
