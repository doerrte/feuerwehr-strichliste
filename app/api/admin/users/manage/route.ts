import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function requireAdmin() {
  const userId = Number(
    cookies().get("userId")?.value
  );

  if (!userId) return false;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return user?.role === "ADMIN";
}

export async function POST(req: Request) {
  try {
    if (!(await requireAdmin())) {
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

    if (action === "delete") {
      // 🔥 zuerst alle Relations löschen

      await prisma.count.deleteMany({
        where: { userId },
      });

      await prisma.countLog.deleteMany({
        where: {
          OR: [
            { userId },
            { adminId: userId },
          ],
        },
      });

      await prisma.user.delete({
        where: { id: userId },
      });

      return NextResponse.json({
        success: true,
      });
    }

    return NextResponse.json({
      error: "Unbekannte Aktion",
    });

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