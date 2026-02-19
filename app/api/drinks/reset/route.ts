import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST() {
  const admin = cookies().get("admin");

  if (admin?.value !== "true") {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  await prisma.drink.updateMany({
    data: { count: 0 },
  });

  return NextResponse.json({ ok: true });
}
