import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);

  await prisma.drink.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);

  const drink = await prisma.drink.update({
    where: { id },
    data: { count: { increment: 1 } },
  });

  return NextResponse.json(drink);
}
