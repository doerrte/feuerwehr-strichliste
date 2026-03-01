import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

//
// 🔄 Bestand aktualisieren
//
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const drinkId = Number(params.id);
    const body = await request.json();
    const { stock } = body;

    if (isNaN(drinkId) || typeof stock !== "number") {
      return NextResponse.json(
        { error: "Ungültige Daten" },
        { status: 400 }
      );
    }

    const updated = await prisma.drink.update({
      where: { id: drinkId },
      data: { stock },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH DRINK ERROR:", error);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}

//
// 🗑 Getränk löschen
//
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const drinkId = Number(params.id);

    await prisma.count.deleteMany({
      where: { drinkId },
    });

    await prisma.countLog.deleteMany({
      where: { drinkId },
    });

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