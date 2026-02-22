import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function requireAdmin() {
  const userId = Number(
    cookies().get("userId")?.value
  );

  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.role !== "ADMIN" || !user.active) {
    return null;
  }

  return user;
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Nicht erlaubt" },
        { status: 403 }
      );
    }

    const { userId, action } =
      await req.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: "Ungültige Daten" },
        { status: 400 }
      );
    }

    const targetUser =
      await prisma.user.findUnique({
        where: { id: Number(userId) },
      });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
      );
    }

    /* =========================
       DEAKTIVIEREN
    ========================= */
    if (action === "deactivate") {

      if (admin.id === targetUser.id) {
        return NextResponse.json(
          { error: "Du kannst dich nicht selbst deaktivieren." },
          { status: 400 }
        );
      }

      // mindestens 1 aktiver Admin muss bleiben
      if (targetUser.role === "ADMIN") {
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

      await prisma.user.update({
        where: { id: targetUser.id },
        data: { active: false },
      });

      return NextResponse.json({
        success: true,
      });
    }

    /* =========================
       REAKTIVIEREN
    ========================= */
    if (action === "activate") {

      await prisma.user.update({
        where: { id: targetUser.id },
        data: { active: true },
      });

      return NextResponse.json({
        success: true,
      });
    }

    /* =========================
       LÖSCHEN (Hard Delete)
    ========================= */
    if (action === "delete") {

      if (admin.id === targetUser.id) {
        return NextResponse.json(
          { error: "Du kannst dich nicht selbst löschen." },
          { status: 400 }
        );
      }

      if (targetUser.role === "ADMIN") {
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

      // erst abhängige Daten löschen
      await prisma.count.deleteMany({
        where: { userId: targetUser.id },
      });

      await prisma.countLog.deleteMany({
        where: {
          OR: [
            { userId: targetUser.id },
            { adminId: targetUser.id },
          ],
        },
      });

      await prisma.user.delete({
        where: { id: targetUser.id },
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
    console.error(
      "USER MANAGE ERROR:",
      error
    );

    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}