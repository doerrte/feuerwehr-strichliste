import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function isAdmin() {
  const userId = cookies().get("userId")?.value;
  if (!userId) return false;

  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
  });

  return user?.role === "ADMIN";
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, phone: true, role: true },
  });

  return NextResponse.json(users);
}
