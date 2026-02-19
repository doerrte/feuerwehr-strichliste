import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(
  _: Request,
  { params }: { params: { id: string } }
) {
  const admin = cookies().get("admin");
  if (admin?.value !== "true") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.drinkCount.updateMany({
    where: { userId: Number(params.id) },
    data: { count: 0 },
  });

  return NextResponse.json({ ok: true });
}
