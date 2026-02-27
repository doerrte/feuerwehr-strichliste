import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const drinkId = Number(params.id);

    // 🔥 zuerst Logs löschen (wegen FK)
    await prisma.countLog.deleteMany({
      where: { drinkId },
    });

    // 🔥 dann Counts löschen
    await prisma.count.deleteMany({
      where: { drinkId },
    });

    // 🔥 dann Drink löschen
    await prisma.drink.delete({
      where: { id: drinkId },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("DELETE DRINK ERROR:", error);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}