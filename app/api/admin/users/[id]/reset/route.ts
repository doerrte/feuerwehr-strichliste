import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = Number(params.id);

    if (!userId) {
      return NextResponse.json(
        { error: "Ungültige User ID" },
        { status: 400 }
      );
    }

    // 🔥 Alle Counts dieses Users auf 0 setzen
    await prisma.count.updateMany({
      where: { userId },
      data: { amount: 0 },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("RESET USER COUNTS ERROR:", error);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}
