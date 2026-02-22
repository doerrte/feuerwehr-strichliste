import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = cookies();
  const userId = Number(
    cookieStore.get("userId")?.value
  );

  if (!userId) {
    return NextResponse.json(
      { error: "Nicht eingeloggt" },
      { status: 401 }
    );
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      hasSeenIntro: true,
    },
  });

  return NextResponse.json({ success: true });
}