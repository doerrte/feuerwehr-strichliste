import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

function isAdmin() {
  return !!cookies().get("userId")?.value;
}

// 📥 GET – Alle Getränke
export async function GET() {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const drinks = await prisma.drink.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json(drinks);
}

// ➕ POST – Neues Getränk anlegen
export async function POST(req: Request) {
  try {
    if (!isAdmin()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, unitsPerCase, stock } = await req.json();

    const drink = await prisma.drink.create({
      data: {
        name: name.trim(),
        unitsPerCase: Number(unitsPerCase),
        stock: Number(stock) || 0,
      },
    });

    return NextResponse.json(drink);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}

// 🔄 PATCH – Bestand erhöhen (Nachbestellung)
export async function PATCH(req: Request) {
  try {
    if (!isAdmin()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, addStock } = await req.json();

    const drink = await prisma.drink.update({
      where: { id },
      data: {
        stock: {
          increment: Number(addStock),
        },
      },
    });

    return NextResponse.json(drink);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}

// ❌ DELETE – Getränk löschen
export async function DELETE(req: Request) {
  try {
    if (!isAdmin()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await req.json();

    await prisma.count.deleteMany({
      where: { drinkId: id },
    });

    await prisma.drink.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
