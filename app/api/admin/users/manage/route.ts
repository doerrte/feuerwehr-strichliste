import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = cookies();
  const adminId = Number(cookieStore.get("userId")?.value);

  if (!adminId) {
    return NextResponse.json(
      { error: "Nicht eingeloggt" },
      { status: 401 }
    );
  }

  const admin = await prisma.user.findUnique({
    where: { id: adminId },
  });

  if (admin?.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Nicht erlaubt" },
      { status: 403 }
    );
  }

  const { userId, action } = await req.json();

  if (!userId || !action) {
    return NextResponse.json(
      { error: "Ungültige Daten" },
      { status: 400 }
    );
  }

  if (action === "deactivate") {
    await prisma.user.update({
      where: { id: userId },
      data: { active: false },
    });
  }

  if (action === "activate") {
    await prisma.user.update({
      where: { id: userId },
      data: { active: true },
    });
  }

  if (action === "delete") {
    await prisma.user.update({
      where: { id: userId },
      data: {
        active: false,
        deletedAt: new Date(),
      },
    });
  }

  if (action === "restore") {
    await prisma.user.update({
      where: { id: userId },
      data: {
        active: true,
        deletedAt: null,
      },
    });
  }

  return NextResponse.json({ success: true });
}