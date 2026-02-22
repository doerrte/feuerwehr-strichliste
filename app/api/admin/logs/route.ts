import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const userId = Number(cookies().get("userId")?.value);
  if (!userId) return false;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return user?.role === "ADMIN";
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Nicht erlaubt" }, { status: 403 });
  }

  const logs = await prisma.countLog.findMany({
    include: {
      admin: true,
      user: true,
      drink: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(logs);
}