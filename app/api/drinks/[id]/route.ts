import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const userId = Number(cookies().get("userId")?.value);
  if (!userId) return false;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return user?.role === "ADMIN";
}

/* =========================
   PATCH – Getränk bearbeiten
========================= */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { error: "Nicht erlaubt" },
      { status: 403 }
    );
  }

  const drinkId = Number(params.id);
  const { name, stock, unitsPerCase } =
    await req.json();

  const updated = await prisma.drink.update({
    where: { id: drinkId },
    data: {
      name,
      stock,
      unitsPerCase,
    },
  });

  return NextResponse.json(updated);
}

/* =========================
   DELETE – Getränk löschen
========================= */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { error: "Nicht erlaubt" },
      { status: 403 }
    );
  }

  const drinkId = Number(params.id);

  await prisma.count.deleteMany({
    where: { drinkId },
  });

  await prisma.drink.delete({
    where: { id: drinkId },
  });

  return NextResponse.json({ success: true });
}