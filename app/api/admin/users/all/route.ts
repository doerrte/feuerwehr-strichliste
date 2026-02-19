import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

function isAdmin() {
  const userId = cookies().get("userId")?.value;
  return !!userId;
}

// 👥 ALLE Benutzer (inkl. deaktivierte)
export async function GET() {
  try {
    if (!isAdmin()) {
      return NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    const users = await prisma.user.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });

    return NextResponse.json(users);

  } catch (error) {
    console.error("GET ALL USERS ERROR:", error);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}
