import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const admin = cookies().get("admin");

  if (admin?.value !== "true") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { drinkId, amount } = await req.json();

  if (!drinkId || !amount) {
    return NextResponse.json(
      { error: "Fehlende Daten" },
      { status: 400 }
    );
  }

  const entry = await prisma.count.findUnique({
    where: {
      userId_drinkId: {
        userId: Number(params.id),
        drinkId: Number(drinkId),
      },
    },
  });

  if (!entry) {
    return NextResponse.json(
      { error: "Eintrag nicht gefunden" },
      { status: 404 }
    );
  }

  await prisma.count.update({
    where: { id: entry.id },
    data: {
      amount: Math.max(0, entry.amount - Number(amount)),
    },
  });

  return NextResponse.json({ ok: true });
}
