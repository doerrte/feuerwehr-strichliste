import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // 🔥 Cookie direkt aus Request lesen
    const cookieHeader = request.headers.get("cookie");

    if (!cookieHeader) {
      return NextResponse.json(
        { error: "Nicht eingeloggt" },
        { status: 401 }
      );
    }

    const match = cookieHeader.match(/userId=(\d+)/);

    if (!match) {
      return NextResponse.json(
        { error: "Kein userId Cookie" },
        { status: 401 }
      );
    }

    const userId = Number(match[1]);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User nicht gefunden" },
        { status: 401 }
      );
    }

    return NextResponse.json(user);

  } catch (err) {
    console.error("ME ERROR:", err);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}
