import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function requireAdmin() {
  const userId = cookies().get("userId")?.value;
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user || user.role !== "ADMIN") return null;

  return user;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin)
    return NextResponse.json(
      { error: "Nicht erlaubt" },
      { status: 403 }
    );

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      active: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(users);
}