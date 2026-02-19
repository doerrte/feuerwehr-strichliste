import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

function isAdmin() {
  return !!cookies().get("userId")?.value;
}

// 📝 Getränk bearbeiten
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!isAdmin()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const id = Number(params.id);
    const { name, stock, unitsPerCase } = await req.json();

    const drink = await prisma.drink.update({
      where: { id },
      data: {
        name,
        stock: Number(stock),
        unitsPerCase: Number(unitsPerCase),
      },
    });

    return NextResponse.json(drink);
  } catch (err) {
    console.error("DRINK UPDATE ERROR:", err);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}

// ❌ Getränk löschen
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!isAdmin()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const id = Number(params.id);

    // zuerst alle Counts löschen
    await prisma.count.deleteMany({
      where: { drinkId: id },
    });

    await prisma.drink.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DRINK DELETE ERROR:", err);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}
