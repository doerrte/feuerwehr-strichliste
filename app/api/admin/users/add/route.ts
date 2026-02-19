import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPin } from "@/lib/hash";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const admin = cookies().get("admin");
  if (admin?.value !== "true") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, phone, pin } = await req.json();

  if (!name || !phone || !pin) {
    return NextResponse.json(
      { error: "Fehlende Daten" },
      { status: 400 }
    );
  }

  const pinHash = await hashPin(pin);

  await prisma.user.create({
    data: {
      name,
      phone,
      pinHash,
    },
  });

  return NextResponse.json({ ok: true });
}
