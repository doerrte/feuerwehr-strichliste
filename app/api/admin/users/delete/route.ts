import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

function isAdmin() {
  const userId = cookies().get("userId")?.value;
  return !!userId;
}

export async function POST(req: Request) {
  try {
    if (!isAdmin()) {
      return NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId fehlt" },
        { status: 400 }
      );
    }

    // 🔥 Erst alle Counts löschen
    await prisma.count.deleteMany({
      where: { userId },
    });

    // 🔥 Dann Benutzer löschen
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}
