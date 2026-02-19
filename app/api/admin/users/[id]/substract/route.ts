import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const admin = cookies().get("admin");
  if (admin?.value !== "true") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { drinkId, amount } = await req.json();

  const entry = await prisma.drinkCount.findUnique({
    where: {
      userId_drinkId: {
        userId: Number(params.id),
        drinkId: Number(drinkId),
      },
    },
  });

  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.drinkCount.update({
    where: { id: entry.id },
    data: {
      count: Math.max(0, entry.count - amount),
    },
  });

  return NextResponse.json({ ok: true });
}
