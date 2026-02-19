import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

function isAdmin() {
  return !!cookies().get("userId")?.value;
}

export async function POST() {
  try {
    if (!isAdmin()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.drink.updateMany({
      data: { stock: 0 },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DRINK RESET ERROR:", err);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}
