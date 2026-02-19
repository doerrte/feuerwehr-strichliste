import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPin } from "@/lib/hash";

export async function POST(req: Request) {
  const { name, pin } = await req.json();

  if (!name || !pin) {
    return NextResponse.json({ error: "Fehlende Daten" }, { status: 400 });
  }

  const pinHash = await hashPin(pin);

  await prisma.admin.create({
    data: { name, pinHash },
  });

  return NextResponse.json({ ok: true });
}
