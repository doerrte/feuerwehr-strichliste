import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = cookies().get("admin");

    if (!admin || admin.value !== "true") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        active: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ users });

  } catch (error) {
    console.error("GET ALL USERS ERROR:", error);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}
