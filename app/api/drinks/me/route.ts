import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

//
// 🔥 GET → Alle Getränke für Lagerseite
//
export async function GET() {
  try {
    const userIdRaw = cookies().get("userId")?.value;

    if (!userIdRaw) {
      return NextResponse.json(
        { error: "Nicht eingeloggt" },
        { status: 401 }
      );
    }

    const drinks = await prisma.drink.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(drinks);

  } catch (error) {
    console.error("GET DRINKS ERROR:", error);

    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}

//
// 🔥 POST → Neues Getränk erstellen
//
export async function POST(req: Request) {
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

    const body = await req.json();

    const name = body.name?.trim();
    const stock = parseInt(body.stock);
    const unitsPerCase = parseInt(body.unitsPerCase);
    const minStock = parseInt(body.minStock);

    if (!name || isNaN(stock) || isNaN(unitsPerCase) || isNaN(minStock)) {
      return NextResponse.json(
        { error: "Ungültige Eingaben" },
        { status: 400 }
      );
    }

    await prisma.drink.create({
      data: {
        name,
        stock,
        unitsPerCase,
        minStock,
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("CREATE DRINK ERROR:", error);

    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}