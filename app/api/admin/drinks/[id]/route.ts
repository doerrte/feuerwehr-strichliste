import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

function isAdmin() {
  return !!cookies().get("userId")?.value;
}

// GET – einzelnes Getränk laden
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const drink = await prisma.drink.findUnique({
    where: { id: Number(params.id) },
  });

  if (!drink) {
    return NextResponse.json(
      { error: "Nicht gefunden" },
      { status: 404 }
    );
  }

  return NextResponse.json(drink);
}

// PUT – Getränk bearbeiten (Bestand oder Name ändern)
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!isAdmin()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, unitsPerCase, stock } = await req.json();

    const updated = await prisma.drink.update({
      where: { id: Number(params.id) },
      data: {
        name: name?.trim(),
        unitsPerCase: unitsPerCase
          ? Number(unitsPerCase)
          : undefined,
        stock: stock !== undefined
          ? Number(stock)
          : undefined,
      },
    });

    return NextResponse.json(updated);

  } catch (error) {
    console.error("DRINK UPDATE ERROR:", error);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}

// DELETE – Getränk löschen
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!isAdmin()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.count.deleteMany({
      where: { drinkId: Number(params.id) },
    });

    await prisma.drink.delete({
      where: { id: Number(params.id) },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("DRINK DELETE ERROR:", error);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}
