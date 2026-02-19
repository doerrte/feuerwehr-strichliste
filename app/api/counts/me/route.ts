import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = cookies().get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const counts = await prisma.count.findMany({
      where: { userId: Number(userId) },
      include: {
        drink: true,
      },
    });

    return NextResponse.json(counts);

  } catch (error) {
    console.error("COUNTS ERROR:", error);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}
