import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const users = await prisma.user.findMany({
    include: {
      counts: true,
    },
  });

  const result = users.map((u) => ({
    id: u.id,
    name: u.name,
    active: u.active,
    total: u.counts.reduce(
      (sum, c) => sum + c.amount,
      0
    ),
  }));

  return NextResponse.json(result);
}