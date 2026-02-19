import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

function isAdmin() {
  const auth = cookies().get("auth");
  if (!auth) return false;
  try {
    return JSON.parse(auth.value).role === "ADMIN";
  } catch {
    return false;
  }
}

export async function GET() {
  if (!isAdmin()) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    include: {
      counts: {
        include: {
          drink: true,
        },
      },
    },
  });

  const result = users.map((u) => ({
    id: u.id,
    name: u.name,
    drinks: u.counts.map((c) => ({
      drinkId: c.drinkId,
      name: c.drink.name,
      amount: c.amount,
    })),
  }));

  return NextResponse.json(result);
}
