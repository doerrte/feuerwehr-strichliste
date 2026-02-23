import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const userIdRaw = cookies().get("userId")?.value;
  if (!userIdRaw) return false;

  const user = await prisma.user.findUnique({
    where: { id: Number(userIdRaw) },
  });

  return user?.role === "ADMIN" && user.active;
}

export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json(
        { error: "Nicht erlaubt" },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      where: { active: true },
      include: {
        counts: {
          include: {
            drink: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const result = users.map((user) => {
      const total = user.counts.reduce(
        (sum, c) => sum + c.amount,
        0
      );

      return {
        id: user.id,
        name: user.name,
        role: user.role,
        total,
        drinks: user.counts.map((c) => ({
          drinkId: c.drinkId,
          drinkName: c.drink.name,
          amount: c.amount,
        })),
      };
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error("STRICHLISTE ERROR:", error);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}