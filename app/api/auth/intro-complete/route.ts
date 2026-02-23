import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const cookieStore = cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return NextResponse.json(
      { error: "Nicht eingeloggt" },
      { status: 401 }
    );
  }

  await prisma.user.update({
    where: { id: Number(userId) },
    data: { hasSeenIntro: true },
  });

  return NextResponse.json({ success: true });
}