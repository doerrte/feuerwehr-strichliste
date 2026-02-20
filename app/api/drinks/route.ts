import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const drinks = await prisma.drink.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(drinks);
  } catch (error) {
    console.error("Error fetching drinks:", error);
    return NextResponse.json(
      { error: "Failed to fetch drinks" },
      { status: 500 }
    );
  }
}