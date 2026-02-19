import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

function isAdmin() {
  return !!cookies().get("userId")?.value;
}

// GET – alle Getränke laden
export async function GET() {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const drinks = await prisma.drink.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json(drinks);
}

// POST – neues Getränk anlegen
export async function POST(req: Request) {
  try {
    if (!isAdmin()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, unitsPerCase, stock } = await req.json();

    if (!name || !unitsPerCase) {
      return NextResponse.json(
        { error: "Name oder Kistengröße fehlt" },
        { status: 400 }
      );
    }

    const drink = await prisma.drink.create({
      data: {
        name: name.trim(),
        unitsPerCase: Number(unitsPerCase),
        stock: Number(stock) || 0,
      },
    });

    return NextResponse.json(drink);

  } catch (error) {
    console.error("DRINK CREATE ERROR:", error);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}
