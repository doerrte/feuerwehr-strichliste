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

    const { userId, active } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId fehlt" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { active },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("TOGGLE USER ERROR:", error);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}
