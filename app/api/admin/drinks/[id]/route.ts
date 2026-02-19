import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const drinks = await prisma.drink.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(drinks);
}

export async function POST(req: Request) {
  const { name } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "Name fehlt" }, { status: 400 });
  }

  const drink = await prisma.drink.create({
    data: { name },
  });

  return NextResponse.json(drink);
}
