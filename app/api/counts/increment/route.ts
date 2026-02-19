import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { drinkId } = await req.json();
    const userId = cookies().get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
        data: { amount: { increment: 1 } },
      });
    } else {
      await prisma.count.create({
        data: {
          userId: Number(userId),
          drinkId: Number(drinkId),
          amount: 1,
        },
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("INCREMENT ERROR:", error);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
