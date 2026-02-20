import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const drinks = await prisma.drink.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        crates: true,
        bottles: true,
        bottlesPerCrate: true,
      },
    });

    return NextResponse.json(drinks);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch drinks" },
      { status: 500 }
    );
  }
}