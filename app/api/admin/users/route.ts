import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = cookies();
  const adminId = Number(cookieStore.get("userId")?.value);

  if (!adminId) {
    return NextResponse.json(
      { error: "Nicht eingeloggt" },
      { status: 401 }
    );
  }

  const admin = await prisma.user.findUnique({
    where: { id: adminId },
  });

  if (admin?.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Nicht erlaubt" },
      { status: 403 }
    );
  }

  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json(users);
}