import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ===============================
   🔐 Admin prüfen
================================= */
async function requireAdmin() {
  const userIdRaw = cookies().get("userId")?.value;
  if (!userIdRaw) return null;

  const userId = Number(userIdRaw);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.role !== "ADMIN" || !user.active) {
    return null;
  }

  return userId;
}

/* ===============================
   👤 User verwalten
================================= */
export async function POST(req: Request) {
  try {
    const adminId = await requireAdmin();

    if (!adminId) {
      return NextResponse.json(
        { error: "Nicht erlaubt" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const userId = Number(body.userId);
    const action = body.action;

    if (!userId || !action) {
      return NextResponse.json(
        { error: "Ungültige Daten" },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
      );
    }

    /* ===============================
       🚫 Sich selbst deaktivieren?
    ================================= */
    if (
      action === "deactivate" &&
      userId === adminId
    ) {
      return NextResponse.json(
        { error: "Du kannst dich nicht selbst deaktivieren." },
        { status: 400 }
      );
    }

    /* ===============================
       🚫 Letzten Admin deaktivieren?
    ================================= */
    if (
      action === "deactivate" &&
      targetUser.role === "ADMIN"
    ) {
      const activeAdmins =
        await prisma.user.count({
          where: {
            role: "ADMIN",
            active: true,
          },
        });

      if (activeAdmins <= 1) {
        return NextResponse.json(
          { error: "Mindestens ein aktiver Admin muss bleiben." },
          { status: 400 }
        );
      }
    }

    /* ===============================
       🔄 Aktionen
    ================================= */

    if (action === "deactivate") {
      await prisma.user.update({
        where: { id: userId },
        data: { active: false },
      });

      return NextResponse.json({
        success: true,
      });
    }

    if (action === "activate") {
      await prisma.user.update({
        where: { id: userId },
        data: { active: true },
      });

      return NextResponse.json({
        success: true,
      });
    }

    if (action === "delete") {
      // Counts löschen
      await prisma.count.deleteMany({
        where: { userId },
      });

      // Logs löschen
      await prisma.countLog.deleteMany({
        where: { userId },
      });

      // User löschen
      await prisma.user.delete({
        where: { id: userId },
      });

      return NextResponse.json({
        success: true,
      });
    }

    return NextResponse.json(
      { error: "Unbekannte Aktion" },
      { status: 400 }
    );
  } catch (error) {
    console.error("USER MANAGE ERROR:", error);

    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}