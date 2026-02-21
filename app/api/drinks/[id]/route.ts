import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function requireAdmin() {
  const userId = Number(cookies().get("userId")?.value);
  if (!userId) return false;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.role !== "ADMIN") return false;

  return true;
}

/* =========================
   PATCH – Aktivieren/Deaktivieren
========================= */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) {
    return NextResponse.json(
      { error: "Nicht erlaubt" },
      { status: 403 }
    );
  }

  const id = Number(params.id);
  const { active } = await req.json();

  if (typeof active !== "boolean") {
    return NextResponse.json(
      { error: "Ungültiger Wert" },
      { status: 400 }
    );
  }

  await prisma.drink.update({
    where: { id },
    data: { active },
  });

  return NextResponse.json({ success: true });
}