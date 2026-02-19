import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

function getCurrentUserId() {
  return Number(cookies().get("userId")?.value);
}

function isAdmin() {
  return !!getCurrentUserId();
}

export async function POST(req: Request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const currentUserId = getCurrentUserId();
  const { userId, action } = await req.json();

  if (!userId || !action) {
    return NextResponse.json(
      { error: "Fehlende Daten" },
      { status: 400 }
    );
  }

  // ❌ Admin darf sich nicht selbst löschen
  if (action === "delete" && userId === currentUserId) {
    return NextResponse.json(
      { error: "Admin kann sich nicht selbst löschen" },
      { status: 400 }
    );
  }

  if (action === "toggle") {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User nicht gefunden" },
        { status: 404 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { active: !user.active },
    });

    return NextResponse.json({ success: true });
  }

  if (action === "delete") {
    await prisma.count.deleteMany({
      where: { userId },
    });

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { error: "Ungültige Aktion" },
    { status: 400 }
  );
}
