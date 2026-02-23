import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const adminId = cookieStore.get("userId")?.value;

    if (!adminId) {
      return NextResponse.json(
        { error: "Nicht eingeloggt" },
        { status: 401 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: { id: Number(adminId) },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id, action } = await req.json();

    if (!id || !action) {
      return NextResponse.json(
        { error: "Fehlende Daten" },
        { status: 400 }
      );
    }

    if (action === "deactivate") {
      await prisma.user.update({
        where: { id },
        data: { active: false },
      });
    }

    else if (action === "activate") {
      await prisma.user.update({
        where: { id },
        data: { active: true },
      });
    }

    else if (action === "delete") {
      await prisma.user.delete({
        where: { id },
      });
    }

    else {
      return NextResponse.json(
        { error: "Ungültige Aktion" },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error("MANAGE USER ERROR:", error);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}