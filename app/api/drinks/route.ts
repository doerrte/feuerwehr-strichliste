import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const drinks = await prisma.drink.findMany();
    return NextResponse.json(drinks);
  } catch (error) {
    console.error("DRINKS ERROR:", error);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
