import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

function isAdmin() {
  try {
    return JSON.parse(cookies().get("auth")!.value).role === "ADMIN";
  } catch {
    return false;
  }
}

export async function GET() {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    include: {
      counts: {
        include: {
          drink: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const result = users.map((u) => {
    const total = u.counts.reduce((sum, c) => sum + c.amount, 0);

    return {
      id: u.id,
      name: u.name,
      phone: u.phone,
      total,
      drinks: u.counts.map((c) => ({
        name: c.drink.name,
        amount: c.amount,
      })),
    };
  });

  return NextResponse.json(result);
}
