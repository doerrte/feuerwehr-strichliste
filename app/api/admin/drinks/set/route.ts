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

export async function POST(req: Request) {
  if (!isAdmin()) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const { userId, drinkId, amount } = await req.json();

  if (
    typeof userId !== "number" ||
    typeof drinkId !== "number" ||
    typeof amount !== "number"
  ) {
    return NextResponse.json(
      { error: "Ungültige Daten" },
      { status: 400 }
    );
  }

  await prisma.count.upsert({
    where: {
      userId_drinkId: {
        userId,
        drinkId,
      },
    },
    update: {
      amount,
    },
    create: {
      userId,
      drinkId,
      amount,
    },
  });

  return NextResponse.json({ ok: true });
}
