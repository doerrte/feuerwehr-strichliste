import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = Number(cookies().get("userId")?.value);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        role: true,
        active: true,
      },
    });

    if (!user || !user.active) {
      const response = NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );

      response.cookies.delete("userId");
      response.cookies.delete("role");

      return response;
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      role: user.role,
    });

  } catch {
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}