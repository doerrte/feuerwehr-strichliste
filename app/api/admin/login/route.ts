import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPin } from "@/lib/hash";

export async function POST(req: Request) {
  const { pin } = await req.json();

  if (!pin) {
    return NextResponse.json(
      { error: "PIN fehlt" },
      { status: 400 }
    );
  }

  const admins = await prisma.admin.findMany();

  for (const admin of admins) {
    const ok = await verifyPin(pin, admin.pinHash);

    if (ok) {
      const res = NextResponse.json({ ok: true });

      // 🔑 HIER PASSIERT DIE ADMIN-ROLLE
      res.cookies.set("admin", "true", {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });

      return res;
    }
  }

  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}
