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

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Fehlende Benutzer-ID" },
        { status: 400 }
      );
    }

    if (Number(id) === Number(adminId)) {
      return NextResponse.json(
        { error: "Du kannst dich nicht selbst löschen" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
      );
    }

    // 🔥 Wichtig: zuerst abhängige Daten löschen
    await prisma.count.deleteMany({
      where: { userId: Number(id) },
    });

    await prisma.countLog.deleteMany({
      where: {
        OR: [
          { userId: Number(id) },
          { adminId: Number(id) },
        ],
      },
    });

    await prisma.user.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}