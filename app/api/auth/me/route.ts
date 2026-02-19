import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = cookies().get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Nicht eingeloggt" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        id: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error("ME ERROR:", error);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}
