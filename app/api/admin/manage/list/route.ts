import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const admins = await prisma.admin.findMany({
    select: { id: true, name: true },
  });

  return NextResponse.json({ admins });
}
