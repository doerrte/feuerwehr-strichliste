import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function requireAdmin() {
  const userId = Number(cookies().get("userId")?.value);
  if (!userId) return false;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return user?.role === "ADMIN";
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { error: "Nicht erlaubt" },
      { status: 403 }
    );
  }

  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json(
      { error: "userId fehlt" },
      { status: 400 }
    );
  }

  // Alle Counts auf 0 setzen
  await prisma.count.updateMany({
    where: { userId },
    data: { amount: 0 },
  });

  return NextResponse.json({ success: true });
}