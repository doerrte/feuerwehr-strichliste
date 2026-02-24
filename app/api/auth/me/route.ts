import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = cookies();
    const userIdCookie = cookieStore.get("userId");

    if (!userIdCookie) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const userId = Number(userIdCookie.value);

    if (!userId) {
      return NextResponse.json({ user: null }, { status: 200 });
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
        { user: null },
        { status: 200 }
      );

      response.cookies.delete("userId");

      return response;
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("AUTH ME ERROR:", error);

    return NextResponse.json(
      { user: null },
      { status: 200 }
    );
  }
}