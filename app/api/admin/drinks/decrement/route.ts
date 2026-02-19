import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

function requireAdmin() {
  const auth = cookies().get("auth");
  if (!auth) return false;

  try {
    return JSON.parse(auth.value).role === "ADMIN";
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  if (!requireAdmin()) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const userId = Number(body.userId);
  const drinkId = Number(body.drinkId);

  if (!userId || !drinkId) {
    return NextResponse.json(
      { error: "userId oder drinkId fehlt" },
      { status: 400 }
    );
  }

  const existing = await prisma.count.findFirst({
    where: { userId, drinkId },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Eintrag nicht gefunden" },
      { status: 404 }
    );
  }

  await prisma.count.update({
    where: { id: existing.id },
    data: {
      amount: Math.max(0, existing.amount - 1),
    },
  });

  return NextResponse.json({ success: true });
}
