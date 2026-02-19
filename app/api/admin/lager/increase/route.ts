import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

function isAdmin() {
  return !!cookies().get("userId")?.value;
}

export async function POST(req: Request) {
  if (!isAdmin()) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const { drinkId, amount } = await req.json();

  if (!drinkId || !amount) {
    return NextResponse.json(
      { error: "Ungültige Daten" },
      { status: 400 }
    );
  }

  await prisma.drink.update({
    where: { id: drinkId },
    data: {
      stock: {
        increment: Number(amount),
      },
    },
  });

  return NextResponse.json({ success: true });
}
